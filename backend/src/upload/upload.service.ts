import { Injectable, BadRequestException } from '@nestjs/common';
import { CloudinaryService } from '../config/cloudinary.config';

@Injectable()
export class UploadService {
  constructor(private cloudinaryService: CloudinaryService) {}

  async uploadSingle(
    file: Express.Multer.File,
    folder = 'general',
  ): Promise<{ url: string; publicId: string }> {
    if (!file) throw new BadRequestException('No file provided');

    const result = await this.cloudinaryService.uploadFile(file, folder);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    folder = 'general',
  ): Promise<{ url: string; publicId: string }[]> {
    if (!files || files.length === 0) throw new BadRequestException('No files provided');

    const results = await this.cloudinaryService.uploadMultiple(files, folder);

    return results.map((r) => ({
      url: r.secure_url,
      publicId: r.public_id,
    }));
  }

  async delete(publicId: string): Promise<{ message: string }> {
    await this.cloudinaryService.deleteFile(publicId);
    return { message: 'File deleted successfully' };
  }
}
