import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * A generic Zod-based validation pipe.
 * Usage: @UsePipes(new ZodValidationPipe(myZodSchema))
 *
 * Since zod is not currently installed, this pipe accepts any object
 * with a `parse` method that throws on failure (Zod-compatible interface).
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: { parse: (value: unknown) => unknown }) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error: any) {
      const message =
        error?.errors?.map((e: any) => e.message).join(', ') ||
        'Validation failed';
      throw new BadRequestException(message);
    }
  }
}
