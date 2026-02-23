export type PostType = 'INFORMATIVE' | 'ACTIONABLE' | 'LEAD_GEN';
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Post {
  id: string;
  slug: string;
  type: PostType;
  status: PostStatus;
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  tags: string[];
  ctaLabel?: string;
  ctaType?: 'journey' | 'plan';
  ctaPlanId?: string;
  metaTitle?: string;
  metaDesc?: string;
  sortOrder: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostLead {
  id: string;
  postId: string;
  name?: string;
  mobile: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: string;
}

export interface CreatePostRequest {
  slug?: string;
  type: PostType;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  ctaLabel?: string;
  ctaType?: 'journey' | 'plan';
  ctaPlanId?: string;
  metaTitle?: string;
  metaDesc?: string;
  sortOrder?: number;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  status?: PostStatus;
}

export interface SubmitPostLeadRequest {
  name?: string;
  mobile: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}
