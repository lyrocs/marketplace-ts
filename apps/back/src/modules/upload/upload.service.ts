import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private s3Endpoint: string | undefined;
  private s3Bucket: string;
  private s3BaseUrl: string | undefined;

  constructor(private configService: ConfigService) {
    this.s3Endpoint = configService.get<string>('S3_ENDPOINT');
    this.s3Bucket =
      configService.get<string>('S3_BUCKET') ||
      configService.get<string>('AWS_S3_BUCKET') ||
      'marketplace-ts-uploads';
    this.s3BaseUrl = configService.get<string>('S3_BASE_URL');

    const s3Config: any = {
      region: configService.get<string>('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey:
          configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    };

    // If using custom S3 endpoint (not AWS)
    if (this.s3Endpoint) {
      s3Config.endpoint = this.s3Endpoint;
      s3Config.forcePathStyle = true; // Required for non-AWS S3
    }

    this.s3Client = new S3Client(s3Config);
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'deals',
  ): Promise<string> {
    try {
      const ext = file.originalname.split('.').pop() || 'jpg';
      const key = `${folder}/${uuidv4()}.${ext}`;

      console.log('Uploading to S3:', {
        bucket: this.s3Bucket,
        key,
        endpoint: this.s3Endpoint || 'default',
      });

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.s3Bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          CacheControl: 'public, max-age=31536000',
        }),
      );

      // Return URL based on configuration
      let url: string;
      if (this.s3BaseUrl) {
        // Use custom base URL if provided
        url = `${this.s3BaseUrl}/${key}`;
      } else if (this.s3Endpoint) {
        // Use custom endpoint URL
        url = `${this.s3Endpoint}/${this.s3Bucket}/${key}`;
      } else {
        // Default to AWS S3 URL format
        url = `https://${this.s3Bucket}.s3.amazonaws.com/${key}`;
      }

      console.log('Upload successful, URL:', url);
      return url;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  isS3Url(url: string): boolean {
    if (this.s3BaseUrl && url.startsWith(this.s3BaseUrl)) return true;
    if (this.s3Endpoint && url.startsWith(this.s3Endpoint)) return true;
    if (url.includes(`${this.s3Bucket}.s3.amazonaws.com`)) return true;
    return false;
  }

  async uploadFromUrl(
    url: string,
    folder = 'products',
  ): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Derive extension from content-type or URL
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    const ext = extMap[contentType] || url.split('.').pop()?.split('?')[0] || 'jpg';
    const key = `${folder}/${uuidv4()}.${ext}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000',
      }),
    );

    if (this.s3BaseUrl) return `${this.s3BaseUrl}/${key}`;
    if (this.s3Endpoint) return `${this.s3Endpoint}/${this.s3Bucket}/${key}`;
    return `https://${this.s3Bucket}.s3.amazonaws.com/${key}`;
  }

  async deleteImage(url: string): Promise<void> {
    // Extract key from URL
    const urlObj = new URL(url);
    let key = urlObj.pathname.substring(1); // Remove leading /

    // If using path-style S3 (custom endpoint), remove bucket name from path
    if (this.s3Endpoint && key.startsWith(`${this.s3Bucket}/`)) {
      key = key.substring(this.s3Bucket.length + 1);
    }

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
      }),
    );
  }
}
