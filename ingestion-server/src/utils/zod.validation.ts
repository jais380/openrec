import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: ZodSchema) {}

    transform(value: unknown) {
        const result = this.schema.safeParse(value);
        if(!result.success) {
            throw new BadRequestException(this.formatZodError(result.error));
        }

        return result.data;
    }

    formatZodError(error: ZodError) {
        return error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message
        }));
    }
}
