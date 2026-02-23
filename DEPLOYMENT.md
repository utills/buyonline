# BuyOnline — Cloud Run Deployment Guide

> **Platform:** Google Cloud Run (fully managed, serverless)
> **Environment:** SIT / Production

---

## Architecture

```
GitHub Actions (on push to main)
      │
      ├─ 1. CI checks (lint, typecheck, tests)
      ├─ 2. Build & push Docker images → Artifact Registry
      ├─ 3. Run DB migrations → Cloud Run Job
      ├─ 4. Deploy API → Cloud Run service
      └─ 5. Deploy Web → Cloud Run service

Cloud Run Services
      ├─ buyonline-api  (NestJS, port 8080, min 1 instance)
      │     ├─ Cloud SQL Auth Proxy (unix socket, automatic)
      │     └─ VPC Connector → Memorystore Redis
      └─ buyonline-web  (Next.js standalone, scales to zero)

Infrastructure
      ├─ Artifact Registry   — Docker images
      ├─ Cloud SQL (PG 16)   — Primary database
      ├─ Memorystore Redis   — Sessions & chat history
      └─ Secret Manager      — All secrets
```

---

## One-Time GCP Setup

Run these once before the first deployment.

### 1. Enable APIs
```bash
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  vpcaccess.googleapis.com \
  --project YOUR_PROJECT_ID
```

### 2. Create Artifact Registry repository
```bash
gcloud artifacts repositories create buyonline \
  --repository-format docker \
  --location REGION \
  --project YOUR_PROJECT_ID
```

### 3. Create Cloud SQL instance
```bash
gcloud sql instances create buyonline-pg \
  --database-version POSTGRES_16 \
  --tier db-f1-micro \
  --region REGION \
  --project YOUR_PROJECT_ID

gcloud sql databases create buyonline --instance buyonline-pg --project YOUR_PROJECT_ID
gcloud sql users create buyonline --instance buyonline-pg \
  --password YOUR_DB_PASSWORD --project YOUR_PROJECT_ID
```

### 4. Create Memorystore Redis
```bash
gcloud redis instances create buyonline-redis \
  --size 1 \
  --region REGION \
  --project YOUR_PROJECT_ID
```

### 5. Create VPC Serverless Connector (for Redis access)
```bash
gcloud compute networks vpc-access connectors create buyonline-connector \
  --region REGION \
  --network default \
  --range 10.8.0.0/28 \
  --project YOUR_PROJECT_ID
```

### 6. Store secrets in Secret Manager
```bash
# Get Redis IP: gcloud redis instances describe buyonline-redis --region REGION --format "value(host)"

echo -n "postgresql://buyonline:PASSWORD@localhost/buyonline?host=/cloudsql/PROJECT:REGION:buyonline-pg" \
  | gcloud secrets create DATABASE_URL --data-file=- --project YOUR_PROJECT_ID

echo -n "redis://REDIS_IP:6379" \
  | gcloud secrets create REDIS_URL --data-file=- --project YOUR_PROJECT_ID

echo -n "your-strong-jwt-secret-min-32-chars" \
  | gcloud secrets create JWT_SECRET --data-file=- --project YOUR_PROJECT_ID

echo -n "sk-ant-api03-..." \
  | gcloud secrets create ANTHROPIC_API_KEY --data-file=- --project YOUR_PROJECT_ID

echo -n "phil-dev-key" \
  | gcloud secrets create COMMS_API_KEY --data-file=- --project YOUR_PROJECT_ID
```

### 7. Create Service Account and grant permissions
```bash
gcloud iam service-accounts create buyonline-sa \
  --display-name "BuyOnline Cloud Run SA" \
  --project YOUR_PROJECT_ID

SA="buyonline-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member "serviceAccount:$SA" --role roles/run.invoker
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member "serviceAccount:$SA" --role roles/cloudsql.client
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member "serviceAccount:$SA" --role roles/secretmanager.secretAccessor
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member "serviceAccount:$SA" --role roles/artifactregistry.reader
```

### 8. Workload Identity Federation (GitHub Actions — no long-lived keys)
```bash
gcloud iam workload-identity-pools create github-pool \
  --location global --project YOUR_PROJECT_ID

gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location global \
  --workload-identity-pool github-pool \
  --issuer-uri "https://token.actions.githubusercontent.com" \
  --attribute-mapping "google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --project YOUR_PROJECT_ID

POOL_ID=$(gcloud iam workload-identity-pools describe github-pool \
  --location global --project YOUR_PROJECT_ID --format "value(name)")

gcloud iam service-accounts add-iam-policy-binding "$SA" \
  --role roles/iam.workloadIdentityUser \
  --member "principalSet://iam.googleapis.com/${POOL_ID}/attribute.repository/utills/buyonline" \
  --project YOUR_PROJECT_ID

# Copy this output → GitHub secret GCP_WORKLOAD_IDENTITY_PROVIDER
gcloud iam workload-identity-pools providers describe github-provider \
  --location global \
  --workload-identity-pool github-pool \
  --project YOUR_PROJECT_ID \
  --format "value(name)"
```

---

## GitHub Repository Configuration

### Secrets (Settings → Secrets and variables → Actions → Secrets tab)

| Secret | Value |
|--------|-------|
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Output of last command above |
| `GCP_SERVICE_ACCOUNT` | `buyonline-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com` |

### Variables (Settings → Secrets and variables → Actions → Variables tab)

| Variable | Example |
|----------|---------|
| `GCP_PROJECT_ID` | `my-gcp-project` |
| `GCP_REGION` | `asia-south1` |
| `ARTIFACT_REGISTRY_REPO` | `asia-south1-docker.pkg.dev/my-project/buyonline` |
| `CLOUD_SQL_INSTANCE` | `my-project:asia-south1:buyonline-pg` |
| `VPC_CONNECTOR` | `projects/my-project/locations/asia-south1/connectors/buyonline-connector` |
| `SIT_API_URL` | `https://buyonline-api-xxxx-as.a.run.app` ← get after first API deploy |
| `COMMS_API_BASE_URL` | `https://comms-svc-phil-ds-...pru.intranet.asia` |
| `COMMS_UNIQUE_ID` | `487327648723` |
| `COMMS_ACCEPT_LANGUAGE` | `432432` |

> **`SIT_API_URL` bootstrap:** On first deploy, set to a placeholder. After the `buyonline-api` service is created, copy its Cloud Run URL from the console, update this variable, then trigger a re-deploy so the web image is rebuilt with the correct URL baked in.

---

## Manual Deploy Commands (gcloud CLI)

Use these to deploy directly without GitHub Actions.

### Prerequisites
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud auth configure-docker REGION-docker.pkg.dev
```

### Build & push images
```bash
REPO="REGION-docker.pkg.dev/YOUR_PROJECT_ID/buyonline"
TAG=$(git rev-parse --short HEAD)

# API image
docker build -f apps/api/Dockerfile \
  -t "$REPO/api:$TAG" -t "$REPO/api:latest" .
docker push "$REPO/api:$TAG"

# Web image (NEXT_PUBLIC_API_URL is baked in at build time)
docker build -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=https://YOUR_API_CLOUD_RUN_URL \
  -t "$REPO/web:$TAG" -t "$REPO/web:latest" .
docker push "$REPO/web:$TAG"
```

### Run DB migrations
```bash
gcloud run jobs deploy buyonline-db-migrate \
  --image "$REPO/api:$TAG" \
  --command "/app/node_modules/.bin/prisma" \
  --args "migrate,deploy" \
  --region REGION \
  --add-cloudsql-instances YOUR_PROJECT_ID:REGION:buyonline-pg \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest" \
  --vpc-connector projects/YOUR_PROJECT_ID/locations/REGION/connectors/buyonline-connector \
  --memory 512Mi \
  --project YOUR_PROJECT_ID

gcloud run jobs execute buyonline-db-migrate \
  --region REGION --wait --project YOUR_PROJECT_ID
```

### Deploy API
```bash
gcloud run deploy buyonline-api \
  --image "$REPO/api:$TAG" \
  --region REGION \
  --add-cloudsql-instances YOUR_PROJECT_ID:REGION:buyonline-pg \
  --vpc-connector projects/YOUR_PROJECT_ID/locations/REGION/connectors/buyonline-connector \
  --vpc-egress private-ranges-only \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,REDIS_URL=REDIS_URL:latest,JWT_SECRET=JWT_SECRET:latest,ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest,COMMS_API_KEY=COMMS_API_KEY:latest" \
  --set-env-vars "NODE_ENV=production,COMMS_TENANT=PHIL,COMMS_UNIQUE_ID=487327648723,COMMS_ACCEPT_LANGUAGE=432432,COMMS_API_BASE_URL=https://comms-svc-phil-ds-dev-api.lb1-pruinhlth-dev-az1-dp1d50.pru.intranet.asia" \
  --min-instances 1 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --allow-unauthenticated \
  --project YOUR_PROJECT_ID
```

### Deploy Web
```bash
gcloud run deploy buyonline-web \
  --image "$REPO/web:$TAG" \
  --region REGION \
  --set-env-vars "NODE_ENV=production,NEXT_PUBLIC_API_URL=https://YOUR_API_CLOUD_RUN_URL" \
  --min-instances 0 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --allow-unauthenticated \
  --project YOUR_PROJECT_ID
```

---

## Useful Operations

```bash
# View live logs
gcloud run services logs read buyonline-api --region REGION --limit 100 --follow
gcloud run services logs read buyonline-web --region REGION --limit 100 --follow

# List revisions
gcloud run revisions list --service buyonline-api --region REGION

# Rollback to previous revision
gcloud run services update-traffic buyonline-api \
  --to-revisions PREVIOUS=100 --region REGION

# Update a secret
echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-

# Check service URLs
gcloud run services describe buyonline-api --region REGION --format "value(status.url)"
gcloud run services describe buyonline-web --region REGION --format "value(status.url)"
```

---

## Local Development

```bash
docker compose up -d   # PostgreSQL + Redis
pnpm dev               # web :3000  ·  api :3001
```

OTP bypass: use `123456` in development.
Swagger: http://localhost:3001/api/docs
