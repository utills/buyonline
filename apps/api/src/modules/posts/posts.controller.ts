import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { SubmitLeadDto } from './dto/submit-lead.dto.js';

@Controller('api/v1/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // ─── Public ─────────────────────────────────────────────────────────────────

  @Get()
  listPublished() {
    return this.postsService.listPublished();
  }

  @Get('admin/all')
  listAll() {
    return this.postsService.listAll();
  }

  @Get('admin/leads')
  listLeads(@Query('postId') postId?: string) {
    return this.postsService.listLeads(postId);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Post(':slug/leads')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  submitLead(@Param('slug') slug: string, @Body() dto: SubmitLeadDto) {
    return this.postsService.submitLead(slug, dto);
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────

  @Post('admin')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @Put('admin/:id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto);
  }

  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
