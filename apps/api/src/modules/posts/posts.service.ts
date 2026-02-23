import { Injectable, NotFoundException } from '@nestjs/common';
import { PostStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { SubmitLeadDto } from './dto/submit-lead.dto.js';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublished() {
    return this.prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        type: true,
        status: true,
        title: true,
        excerpt: true,
        coverImage: true,
        tags: true,
        sortOrder: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({ where: { slug } });
    if (!post || post.status !== PostStatus.PUBLISHED) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async listAll() {
    return this.prisma.post.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { _count: { select: { leads: true } } },
    });
  }

  async create(dto: CreatePostDto) {
    const slug = dto.slug ?? slugify(dto.title);
    return this.prisma.post.create({
      data: {
        slug,
        type: dto.type as import('@prisma/client').PostType,
        title: dto.title,
        content: dto.content,
        excerpt: dto.excerpt,
        coverImage: dto.coverImage,
        tags: dto.tags ?? [],
        ctaLabel: dto.ctaLabel,
        ctaType: dto.ctaType,
        ctaPlanId: dto.ctaPlanId,
        metaTitle: dto.metaTitle,
        metaDesc: dto.metaDesc,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdatePostDto) {
    await this.ensureExists(id);
    const data: Record<string, unknown> = { ...dto };

    if (dto.type) data['type'] = dto.type as import('@prisma/client').PostType;
    if (dto.status) {
      data['status'] = dto.status as PostStatus;
      if (dto.status === 'PUBLISHED') {
        data['publishedAt'] = new Date();
      }
    }
    if (dto.tags !== undefined) data['tags'] = dto.tags;

    return this.prisma.post.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.post.delete({ where: { id } });
    return { success: true };
  }

  async submitLead(slug: string, dto: SubmitLeadDto) {
    const post = await this.prisma.post.findUnique({ where: { slug } });
    if (!post || post.status !== PostStatus.PUBLISHED) {
      throw new NotFoundException('Post not found');
    }
    return this.prisma.postLead.create({
      data: {
        postId: post.id,
        name: dto.name,
        mobile: dto.mobile,
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
      },
    });
  }

  async listLeads(postId?: string) {
    return this.prisma.postLead.findMany({
      where: postId ? { postId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { post: { select: { title: true, slug: true } } },
    });
  }

  private async ensureExists(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}
