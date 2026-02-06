import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class UploadService {
  private s3Client: S3Client

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: configService.get<string>('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    })
  }

  async uploadImage(file: Express.Multer.File, folder = 'deals'): Promise<string> {
    const bucket = this.configService.get<string>('AWS_S3_BUCKET') || 'nextrade-uploads'
    const ext = file.originalname.split('.').pop() || 'jpg'
    const key = `${folder}/${uuidv4()}.${ext}`

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: 'public, max-age=31536000',
      }),
    )

    return `https://${bucket}.s3.amazonaws.com/${key}`
  }

  async deleteImage(url: string): Promise<void> {
    const bucket = this.configService.get<string>('AWS_S3_BUCKET') || 'nextrade-uploads'

    // Extract key from URL
    const urlObj = new URL(url)
    const key = urlObj.pathname.substring(1) // Remove leading /

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    )
  }
}
