import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  private readonly bucketName = process.env.MINIO_BUCKET || 'kavachtrust-evidence';
  private isOnline = false;

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY as string,
      secretKey: process.env.MINIO_SECRET_KEY as string,
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Created MinIO bucket: ${this.bucketName}`);
      }
      this.isOnline = true;
      this.logger.log('MinIO connection established');
    } catch (error: any) {
      this.logger.warn(`MinIO connection failed, operating in offline/fallback mode. Reason: ${error.message}`);
      this.isOnline = false;
    }
  }

  async uploadFile(objectName: string, buffer: Buffer, mimeType: string = 'application/octet-stream'): Promise<string> {
    if (!this.isOnline) {
      if (process.env.APP_ENV === 'demo') {
        this.logger.debug(`[Offline Mode] DEMO Simulating upload for ${objectName}`);
        return `offline-mock-url/${this.bucketName}/${objectName}`;
      }
      throw new Error('MinIO storage is unavailable');
    }

    try {
      await this.minioClient.putObject(this.bucketName, objectName, buffer, buffer.length, {
        'Content-Type': mimeType,
      });
      return `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${this.bucketName}/${objectName}`;
    } catch (error: any) {
      this.logger.error(`Failed to upload object ${objectName} to MinIO`, error);
      throw error;
    }
  }

  async downloadFile(objectName: string): Promise<Buffer> {
    if (!this.isOnline) {
      if (process.env.APP_ENV === 'demo') {
        this.logger.debug(`[Offline Mode] DEMO Simulating download for ${objectName}`);
        return Buffer.from('Mock file content for ' + objectName);
      }
      throw new Error('MinIO storage is unavailable');
    }

    try {
      const stream = await this.minioClient.getObject(this.bucketName, objectName);
      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error: any) {
      this.logger.error(`Failed to download object ${objectName} from MinIO`, error);
      throw error;
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    if (!this.isOnline) return;
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
      this.logger.log(`Deleted object ${objectName} from MinIO`);
    } catch (error: any) {
      this.logger.error(`Failed to delete object ${objectName} from MinIO`, error);
    }
  }
}
