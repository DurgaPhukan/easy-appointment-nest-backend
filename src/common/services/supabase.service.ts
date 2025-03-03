import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async uploadFile(
    file: Express.Multer.File,
    path: string,
    bucket?: string,
  ): Promise<string | null> {
    const bucketName = bucket || this.configService.get<string>('supabase.bucket');

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${path}/${Date.now()}.${fileExt}`;

    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    const { data: urlData } = this.supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async deleteFile(path: string, bucket?: string): Promise<boolean> {
    const bucketName = bucket || this.configService.get<string>('supabase.bucket');

    const { error } = await this.supabase.storage
      .from(bucketName)
      .remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  }
}