# BuyOnline — SIT Deployment Guide

> **Audience:** DevOps / Platform Engineering team
> **Environment:** SIT (System Integration Testing)
> **Platform:** Google Cloud Platform — GKE + Cloud SQL + Memorystore

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [GCP Infrastructure Setup](#2-gcp-infrastructure-setup)
3. [GitHub Secrets & Variables](#3-github-secrets--variables)
4. [Docker Image Build Details](#4-docker-image-build-details)
5. [Kubernetes Manifests Structure](#5-kubernetes-manifests-structure)
6. [First-Time Cluster Bootstrap](#6-first-time-cluster-bootstrap)
7. [GitHub Actions CI/CD Pipeline](#7-github-actions-cicd-pipeline)
8. [Database Migrations](#8-database-migrations)
9. [Secrets Management](#9-secrets-management)
10. [Rollback Procedure](#10-rollback-procedure)
11. [Observability & Debugging](#11-observability--debugging)
12. [Placeholder Reference](#12-placeholder-reference)

---

## 1. Architecture Overview

```
GitHub Actions
      │
      ├── CI: lint → typecheck → build → docker validate (on PRs)
      │
      └── Deploy SIT: (on merge to main)
            │
            ├── Build & Push → Artifact Registry
            │     ├── REGION-docker.pkg.dev/PROJECT/buyonline/api:SHA
            │     └── REGION-docker.pkg.dev/PROJECT/buyonline/web:SHA
            │
            └── Deploy → GKE Cluster (buyonline-sit namespace)
                  │
                  ├── DB Migration Job (one-shot, runs prisma migrate deploy)
                  │
                  ├── API Deployment  (NestJS, port 3001)
                  │     └── Cloud SQL Auth Proxy sidecar (port 5432)
                  │
                  ├── Web Deployment  (Next.js standalone, port 3000)
                  │
                  └── GKE Ingress → Cloud Load Balancer
                        ├── api-sit.DOMAIN.com → API Service
                        └── sit.DOMAIN.com     → Web Service

GCP Managed Services:
  ├── Cloud SQL (PostgreSQL 16)     — private IP
  ├── Cloud Memorystore (Redis 7)   — private IP
  └── Artifact Registry             — Docker images
```

---

## 2. GCP Infrastructure Setup

### 2.1 Prerequisites

```bash
# Install & authenticate gcloud CLI
gcloud auth login
gcloud config set project REPLACE_GCP_PROJECT_ID
```

### 2.2 Enable Required APIs

```bash
gcloud services enable \
  container.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  --project=REPLACE_GCP_PROJECT_ID
```

### 2.3 Artifact Registry

```bash
gcloud artifacts repositories create buyonline \
  --repository-format=docker \
  --location=REPLACE_GCP_REGION \
  --description="BuyOnline Docker images" \
  --project=REPLACE_GCP_PROJECT_ID
```

Full registry path:
```
REPLACE_GCP_REGION-docker.pkg.dev/REPLACE_GCP_PROJECT_ID/buyonline
```

### 2.4 GKE Cluster (SIT)

```bash
gcloud container clusters create REPLACE_GKE_CLUSTER_NAME \
  --project=REPLACE_GCP_PROJECT_ID \
  --region=REPLACE_GCP_REGION \
  --num-nodes=2 \
  --machine-type=e2-standard-2 \
  --enable-ip-alias \
  --enable-workload-identity \
  --workload-pool=REPLACE_GCP_PROJECT_ID.svc.id.goog \
  --release-channel=regular \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=4
```

> **Note:** `--enable-workload-identity` is mandatory for Cloud SQL Auth Proxy to work without key files.

### 2.5 Cloud SQL (PostgreSQL 16)

```bash
gcloud sql instances create REPLACE_CLOUD_SQL_INSTANCE_NAME \
  --project=REPLACE_GCP_PROJECT_ID \
  --database-version=POSTGRES_16 \
  --region=REPLACE_GCP_REGION \
  --tier=db-g1-small \
  --storage-auto-increase \
  --availability-type=ZONAL \
  --no-assign-ip \
  --network=default

# Create database
gcloud sql databases create buyonline \
  --instance=REPLACE_CLOUD_SQL_INSTANCE_NAME \
  --project=REPLACE_GCP_PROJECT_ID

# Create user (use a strong password)
gcloud sql users create buyonline \
  --instance=REPLACE_CLOUD_SQL_INSTANCE_NAME \
  --password=REPLACE_DB_PASSWORD \
  --project=REPLACE_GCP_PROJECT_ID
```

**Instance connection name** (needed in CI variables):
```
REPLACE_GCP_PROJECT_ID:REPLACE_GCP_REGION:REPLACE_CLOUD_SQL_INSTANCE_NAME
```

**DATABASE_URL** (used in SIT_DATABASE_URL secret):
```
postgresql://buyonline:REPLACE_DB_PASSWORD@127.0.0.1:5432/buyonline
```
> Host is `127.0.0.1` because Cloud SQL Auth Proxy runs as a sidecar in each pod and binds locally on port 5432.

### 2.6 Cloud Memorystore (Redis 7)

```bash
gcloud redis instances create buyonline-sit-redis \
  --project=REPLACE_GCP_PROJECT_ID \
  --region=REPLACE_GCP_REGION \
  --size=1 \
  --redis-version=redis_7_0 \
  --network=default \
  --tier=basic

# Get the private IP
gcloud redis instances describe buyonline-sit-redis \
  --region=REPLACE_GCP_REGION \
  --project=REPLACE_GCP_PROJECT_ID \
  --format="value(host)"
```

**REDIS_URL** (used in SIT_REDIS_URL secret):
```
redis://REPLACE_REDIS_PRIVATE_IP:6379
```

### 2.7 Static IP for Ingress

```bash
gcloud compute addresses create buyonline-sit-ip \
  --global \
  --project=REPLACE_GCP_PROJECT_ID

# Get the reserved IP
gcloud compute addresses describe buyonline-sit-ip \
  --global \
  --format="value(address)"
```

Update DNS A records:

| Record | Value |
|--------|-------|
| `sit.REPLACE_YOUR_DOMAIN.com` | `STATIC_IP` |
| `api-sit.REPLACE_YOUR_DOMAIN.com` | `STATIC_IP` |

> DNS propagation + Google-managed certificate provisioning can take **10–60 minutes** on first deploy.

---

## 3. GitHub Secrets & Variables

Go to **GitHub → Repository → Settings → Secrets and variables → Actions**.

### 3.1 GitHub Variables (non-sensitive, `vars.*`)

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `GCP_PROJECT_ID` | `my-project-123` | GCP Project ID |
| `GCP_REGION` | `asia-south1` | Primary GCP region |
| `GKE_CLUSTER_NAME` | `buyonline-sit-cluster` | GKE cluster name |
| `ARTIFACT_REGISTRY_REPO` | `asia-south1-docker.pkg.dev/my-project-123/buyonline` | Full Artifact Registry path |
| `CLOUD_SQL_INSTANCE_NAME` | `buyonline-sit-pg` | Cloud SQL instance name (not connection name) |
| `CLOUD_SQL_INSTANCE` | `my-project-123:asia-south1:buyonline-sit-pg` | Full Cloud SQL connection name |
| `SIT_API_URL` | `https://api-sit.example.com` | Public API URL (baked into web image) |
| `SIT_DOMAIN` | `example.com` | Base domain for SIT |

### 3.2 GitHub Secrets (sensitive, `secrets.*`)

| Secret | Description |
|--------|-------------|
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Workload Identity provider resource name |
| `GCP_SERVICE_ACCOUNT` | GSA email for CI/CD pipeline |
| `SIT_DATABASE_URL` | `postgresql://buyonline:PASS@127.0.0.1:5432/buyonline` |
| `SIT_REDIS_URL` | `redis://REDIS_PRIVATE_IP:6379` |
| `SIT_JWT_SECRET` | 32+ char random string (`openssl rand -base64 32`) |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key (`sk-ant-...`) |

### 3.3 Workload Identity Federation Setup

This allows GitHub Actions to authenticate to GCP without storing service account keys.

```bash
# Create the Workload Identity Pool
gcloud iam workload-identity-pools create github-pool \
  --project=REPLACE_GCP_PROJECT_ID \
  --location=global \
  --display-name="GitHub Actions Pool"

# Create the OIDC provider for GitHub
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --project=REPLACE_GCP_PROJECT_ID \
  --location=global \
  --workload-identity-pool=github-pool \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Get the provider resource name (use as GCP_WORKLOAD_IDENTITY_PROVIDER secret)
gcloud iam workload-identity-pools providers describe github-provider \
  --project=REPLACE_GCP_PROJECT_ID \
  --location=global \
  --workload-identity-pool=github-pool \
  --format="value(name)"
# Output: projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider

# Create the CI/CD Service Account (GSA)
gcloud iam service-accounts create buyonline-ci-sa \
  --project=REPLACE_GCP_PROJECT_ID \
  --display-name="BuyOnline CI/CD Service Account"

# Grant required roles to GSA
GSA="buyonline-ci-sa@REPLACE_GCP_PROJECT_ID.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding REPLACE_GCP_PROJECT_ID \
  --member="serviceAccount:${GSA}" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding REPLACE_GCP_PROJECT_ID \
  --member="serviceAccount:${GSA}" \
  --role="roles/container.developer"

gcloud projects add-iam-policy-binding REPLACE_GCP_PROJECT_ID \
  --member="serviceAccount:${GSA}" \
  --role="roles/iam.serviceAccountTokenCreator"

# Allow GitHub Actions (for this repo) to impersonate the GSA
PROJECT_NUMBER=$(gcloud projects describe REPLACE_GCP_PROJECT_ID --format="value(projectNumber)")

gcloud iam service-accounts add-iam-policy-binding "${GSA}" \
  --project=REPLACE_GCP_PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository/REPLACE_GITHUB_ORG/REPLACE_GITHUB_REPO"
```

Save the GSA email as `GCP_SERVICE_ACCOUNT` secret.
Save the provider resource name as `GCP_WORKLOAD_IDENTITY_PROVIDER` secret.

### 3.4 Workload Identity for Pods (Cloud SQL Proxy)

```bash
# Create pod GSA (separate from CI GSA)
gcloud iam service-accounts create buyonline-sit-sa \
  --project=REPLACE_GCP_PROJECT_ID

POD_GSA="buyonline-sit-sa@REPLACE_GCP_PROJECT_ID.iam.gserviceaccount.com"

# Grant Cloud SQL client role
gcloud projects add-iam-policy-binding REPLACE_GCP_PROJECT_ID \
  --member="serviceAccount:${POD_GSA}" \
  --role="roles/cloudsql.client"

# Allow KSA (Kubernetes Service Account) to impersonate GSA
gcloud iam service-accounts add-iam-policy-binding "${POD_GSA}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="serviceAccount:REPLACE_GCP_PROJECT_ID.svc.id.goog[buyonline-sit/buyonline-ksa]"
```

---

## 4. Docker Image Build Details

### Build context

Both Dockerfiles use the **monorepo root** as the Docker build context:

```bash
# From monorepo root:
docker build -f apps/api/Dockerfile -t buyonline/api:local .
docker build -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:3001 \
  -t buyonline/web:local .
```

### API image stages

| Stage | Base | Purpose |
|-------|------|---------|
| `base` | `node:22-alpine` | pnpm + corepack |
| `deps` | `base` | Install all node_modules |
| `builder` | `base` | `prisma generate` + `nest build` |
| `runner` | `node:22-alpine` | Minimal image with `dist/` |

**Final image size:** ~300–400 MB (pnpm store included)

### Web image stages

| Stage | Base | Purpose |
|-------|------|---------|
| `base` | `node:22-alpine` | pnpm + corepack |
| `deps` | `base` | Install all node_modules |
| `builder` | `base` | `next build` (standalone output) |
| `runner` | `node:22-alpine` | `.next/standalone/` only |

**Final image size:** ~150–200 MB (Next.js standalone is minimal)

### Build arguments

| Arg | Applies To | Description |
|-----|-----------|-------------|
| `NEXT_PUBLIC_API_URL` | Web | Public API URL baked into the bundle |

> `NEXT_PUBLIC_*` variables are **build-time** in Next.js. Changing the API URL requires rebuilding the web image.

---

## 5. Kubernetes Manifests Structure

```
k8s/
└── sit/
    ├── namespace.yaml              # buyonline-sit namespace
    ├── serviceaccount.yaml         # KSA with Workload Identity annotation
    ├── configmap.yaml              # Non-sensitive config
    ├── secrets.template.yaml       # TEMPLATE ONLY — real secrets via CI
    ├── api/
    │   ├── deployment.yaml         # API + Cloud SQL proxy sidecar
    │   ├── service.yaml            # ClusterIP + BackendConfig
    │   ├── hpa.yaml                # HorizontalPodAutoscaler
    │   └── migration-job.yaml      # One-shot Prisma migration Job
    ├── web/
    │   ├── deployment.yaml         # Next.js standalone
    │   ├── service.yaml            # ClusterIP + BackendConfig
    │   └── hpa.yaml                # HorizontalPodAutoscaler
    └── ingress.yaml                # GKE Ingress + ManagedCertificate + FrontendConfig
```

### Image placeholder pattern

Manifests with `__API_IMAGE__` or `__WEB_IMAGE__` are patched at deploy time:

```bash
sed "s|__API_IMAGE__|asia-south1-docker.pkg.dev/PROJECT/buyonline/api:SHA|g" \
  k8s/sit/api/deployment.yaml | kubectl apply -f -
```

### Replace placeholders in manifests

Before first manual deployment, globally replace:

| Placeholder | Value |
|-------------|-------|
| `REPLACE_GCP_PROJECT_ID` | Your GCP project ID |
| `REPLACE_GCP_REGION` | e.g., `asia-south1` |
| `REPLACE_CLOUD_SQL_INSTANCE_NAME` | Cloud SQL instance name |
| `REPLACE_YOUR_DOMAIN` | Your base domain |
| `REPLACE_GITHUB_ORG` | GitHub org/user |
| `REPLACE_GITHUB_REPO` | GitHub repo name |

---

## 6. First-Time Cluster Bootstrap

Run **once** when setting up a new environment.

```bash
# 1. Get cluster credentials
gcloud container clusters get-credentials REPLACE_GKE_CLUSTER_NAME \
  --region=REPLACE_GCP_REGION \
  --project=REPLACE_GCP_PROJECT_ID

# 2. Verify connection
kubectl cluster-info

# 3. Create namespace
kubectl apply -f k8s/sit/namespace.yaml

# 4. Create service account (apply after updating REPLACE_GCP_PROJECT_ID)
kubectl apply -f k8s/sit/serviceaccount.yaml

# 5. Create configmap (update placeholders first)
kubectl apply -f k8s/sit/configmap.yaml

# 6. Create secrets manually for first run
kubectl create secret generic buyonline-secrets \
  --namespace=buyonline-sit \
  --from-literal=DATABASE_URL="postgresql://buyonline:PASS@127.0.0.1:5432/buyonline" \
  --from-literal=REDIS_URL="redis://REDIS_PRIVATE_IP:6379" \
  --from-literal=JWT_SECRET="$(openssl rand -base64 32)" \
  --from-literal=ANTHROPIC_API_KEY="sk-ant-..."

# 7. Reserve static IP (if not done already)
gcloud compute addresses create buyonline-sit-ip --global \
  --project=REPLACE_GCP_PROJECT_ID

# 8. Then trigger the GitHub Actions pipeline to build and deploy.
```

---

## 7. GitHub Actions CI/CD Pipeline

### Workflows

| File | Trigger | Jobs |
|------|---------|------|
| `.github/workflows/ci.yml` | PR + non-main push | lint, typecheck, build, docker-validate |
| `.github/workflows/deploy-sit.yml` | Push to `main` | ci-checks → build-and-push → deploy |

### Deployment flow

```
Push to main
     │
     ▼
ci-checks (lint + typecheck + tests)
     │
     ▼
build-and-push
  ├── Authenticate GCP (Workload Identity)
  ├── docker build API  → Artifact Registry
  └── docker build Web  → Artifact Registry
     │
     ▼
deploy
  ├── Get GKE credentials
  ├── Apply namespace + serviceaccount + configmap
  ├── Upsert Kubernetes Secrets from GitHub Secrets
  ├── Run migration Job (wait for completion)
  ├── Deploy API (rolling update, wait for rollout)
  ├── Deploy Web (rolling update, wait for rollout)
  └── Apply Ingress
```

### Environment protection

The `deploy` job runs in the `sit` GitHub Environment. You can add:
- Required reviewers (manual approval before SIT deploy)
- Environment secrets (override repo-level secrets for SIT)

Go to **Settings → Environments → sit → Environment protection rules**.

---

## 8. Database Migrations

### How it works

1. A `batch/v1 Job` named `buyonline-db-migrate` runs before every deployment.
2. The job uses the same API Docker image (which contains Prisma CLI and schema).
3. It connects to Cloud SQL via the Cloud SQL Auth Proxy sidecar.
4. The CI pipeline waits for completion (max 180 seconds) before deploying the API.

### Running migrations manually

```bash
# Get GKE credentials
gcloud container clusters get-credentials REPLACE_GKE_CLUSTER_NAME \
  --region=REPLACE_GCP_REGION --project=REPLACE_GCP_PROJECT_ID

# Delete previous job if exists
kubectl delete job buyonline-db-migrate -n buyonline-sit --ignore-not-found

# Apply migration job (replace image tag)
sed "s|__API_IMAGE__|IMAGE_TAG|g; \
     s|REPLACE_GCP_PROJECT_ID|PROJECT_ID|g; \
     s|REPLACE_GCP_REGION|REGION|g; \
     s|REPLACE_CLOUD_SQL_INSTANCE_NAME|INSTANCE_NAME|g" \
  k8s/sit/api/migration-job.yaml | kubectl apply -f -

# Watch logs
kubectl logs -f -l app=buyonline-migration -n buyonline-sit
```

### Seeding the database (first time only)

```bash
# Run seed via a temporary pod
kubectl run seed-job \
  --image=IMAGE_TAG \
  --restart=Never \
  --namespace=buyonline-sit \
  --env="DATABASE_URL=postgresql://buyonline:PASS@127.0.0.1:5432/buyonline" \
  -- node node_modules/.bin/ts-node prisma/seed.ts
```

---

## 9. Secrets Management

### Current approach: Kubernetes Secrets from GitHub Secrets

The CI pipeline creates/updates Kubernetes Secrets using `kubectl create secret --dry-run=client | kubectl apply`:

```bash
kubectl create secret generic buyonline-secrets \
  --namespace=buyonline-sit \
  --from-literal=KEY=VALUE \
  --dry-run=client -o yaml | kubectl apply -f -
```

**Advantage:** Simple, no extra tooling.
**Limitation:** Secret values exist in GitHub Secrets (encrypted at rest) and in the GH Actions runner memory during deployment.

### Recommended upgrade: Google Secret Manager + External Secrets Operator

For production-grade secret management:

1. Store secrets in **Google Secret Manager**
2. Install [External Secrets Operator](https://external-secrets.io/) in GKE
3. Define `ExternalSecret` resources that pull from GSM into K8s Secrets

```bash
# Install External Secrets Operator
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets \
  -n external-secrets --create-namespace
```

---

## 10. Rollback Procedure

### Automatic rollback on failure

The deployment workflow automatically triggers `kubectl rollout undo` if any step fails.

### Manual rollback

```bash
# Get GKE credentials
gcloud container clusters get-credentials REPLACE_GKE_CLUSTER_NAME \
  --region=REPLACE_GCP_REGION --project=REPLACE_GCP_PROJECT_ID

# View rollout history
kubectl rollout history deployment/buyonline-api -n buyonline-sit
kubectl rollout history deployment/buyonline-web -n buyonline-sit

# Rollback to previous revision
kubectl rollout undo deployment/buyonline-api -n buyonline-sit
kubectl rollout undo deployment/buyonline-web -n buyonline-sit

# Rollback to a specific revision
kubectl rollout undo deployment/buyonline-api \
  --to-revision=2 -n buyonline-sit
```

### Rollback specific image version

```bash
# Update deployment to a previous image tag
kubectl set image deployment/buyonline-api \
  api=ARTIFACT_REGISTRY/api:OLD_SHA \
  -n buyonline-sit

kubectl rollout status deployment/buyonline-api -n buyonline-sit
```

---

## 11. Observability & Debugging

### Check pod status

```bash
kubectl get pods -n buyonline-sit
kubectl describe pod POD_NAME -n buyonline-sit
```

### Stream logs

```bash
# API logs
kubectl logs -f -l app=buyonline-api -c api -n buyonline-sit

# Cloud SQL Proxy logs (in API pod)
kubectl logs -f -l app=buyonline-api -c cloud-sql-proxy -n buyonline-sit

# Web logs
kubectl logs -f -l app=buyonline-web -n buyonline-sit

# Migration job logs
kubectl logs -l app=buyonline-migration -n buyonline-sit
```

### Check ingress & certificate

```bash
# Ingress status
kubectl describe ingress buyonline-sit-ingress -n buyonline-sit

# Managed certificate status (ACTIVE = ready)
kubectl describe managedcertificate buyonline-sit-cert -n buyonline-sit

# Static IP address
gcloud compute addresses describe buyonline-sit-ip --global
```

### HPA status

```bash
kubectl get hpa -n buyonline-sit
kubectl describe hpa buyonline-api-hpa -n buyonline-sit
```

### GKE Metrics

Cloud Monitoring dashboards for GKE are automatically created. Navigate to:
**GCP Console → Kubernetes Engine → Workloads → buyonline-sit**

### Health check URLs (SIT)

| Service | URL |
|---------|-----|
| Web frontend | `https://sit.REPLACE_YOUR_DOMAIN.com` |
| API root | `https://api-sit.REPLACE_YOUR_DOMAIN.com` |

> Note: A proper `/health` or `/healthz` endpoint should be added to the NestJS API for production. Currently the liveness/readiness probes use `GET /` which returns `200 OK`.

---

## 12. Placeholder Reference

All `REPLACE_*` placeholders that must be substituted:

| Placeholder | Where Used | Description |
|-------------|-----------|-------------|
| `REPLACE_GCP_PROJECT_ID` | serviceaccount.yaml, configmap.yaml, migration-job.yaml, api/deployment.yaml, DEPLOYMENT.md | GCP project ID |
| `REPLACE_GCP_REGION` | configmap.yaml, migration-job.yaml, api/deployment.yaml, DEPLOYMENT.md | GCP region (e.g., `asia-south1`) |
| `REPLACE_CLOUD_SQL_INSTANCE_NAME` | configmap.yaml, migration-job.yaml, api/deployment.yaml | Cloud SQL instance name only |
| `REPLACE_YOUR_DOMAIN` | ingress.yaml, configmap.yaml | Base domain (e.g., `example.com`) |
| `REPLACE_GITHUB_ORG` | DEPLOYMENT.md WIF setup | GitHub organisation or username |
| `REPLACE_GITHUB_REPO` | DEPLOYMENT.md WIF setup | GitHub repository name |
| `REPLACE_GKE_CLUSTER_NAME` | DEPLOYMENT.md | GKE cluster name |
| `REPLACE_DB_PASSWORD` | DEPLOYMENT.md | Cloud SQL user password |
| `REPLACE_REDIS_PRIVATE_IP` | secrets.template.yaml | Memorystore private IP |
| `REPLACE_DATABASE_URL` | secrets.template.yaml | Full PostgreSQL connection string |
| `REPLACE_ANTHROPIC_API_KEY` | secrets.template.yaml | Anthropic API key |
| `REPLACE_JWT_SECRET` | secrets.template.yaml | JWT signing secret |

---

## Appendix: Quick Reference Commands

```bash
# Local: Build API image
docker build -f apps/api/Dockerfile -t buyonline/api:local .

# Local: Build Web image
docker build -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:3001 \
  -t buyonline/web:local .

# Run API locally from image
docker run --rm -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://localhost:6379" \
  -e JWT_SECRET="local-secret" \
  buyonline/api:local

# Get all SIT resources
kubectl get all -n buyonline-sit

# Force pod restart
kubectl rollout restart deployment/buyonline-api -n buyonline-sit
kubectl rollout restart deployment/buyonline-web  -n buyonline-sit

# Delete and recreate namespace (DESTRUCTIVE — SIT only)
kubectl delete namespace buyonline-sit
kubectl apply -f k8s/sit/namespace.yaml
```
