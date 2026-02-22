import {
  Controller,
  Post,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UploadService } from './upload.service.js';
import type { Request } from 'express';

interface MulterRequest extends Request {
  file?: {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
    size: number;
  };
}

/**
 * File upload controller.
 * Uses raw request parsing for multipart form data.
 * For production, consider using @nestjs/platform-express with multer.
 */
@Controller('api/v1/uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  async uploadFile(@Req() req: MulterRequest) {
    // Access file from multer middleware (needs to be configured in main.ts or module)
    const file = req.file;

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.uploadService.uploadFile({
      originalname: file.originalname,
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size,
    });
  }
}
