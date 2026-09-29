import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  private readonly bucketName = process.env.MINIO_BUCKET || 'kavachtrust-evidence';
  private isOnline = false;
  private readonly localStorageDir = path.resolve(process.cwd(), 'storage/evidence');

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: (process.env.MINIO_ACCESS_KEY || 'minioadmin') as string,
      secretKey: (process.env.MINIO_SECRET_KEY || 'minioadmin') as string,
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
      this.logger.warn(`MinIO connection unavailable, using real local filesystem storage (${this.localStorageDir}). Reason: ${error.message}`);
      this.isOnline = false;
      if (!fs.existsSync(this.localStorageDir)) {
        fs.mkdirSync(this.localStorageDir, { recursive: true });
      }
    }
  }

  private ensureLocalStorageDir(filePath: string) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async uploadFile(objectName: string, buffer: Buffer, mimeType: string = 'application/octet-stream'): Promise<string> {
    if (!this.isOnline) {
      const localFilePath = path.resolve(this.localStorageDir, objectName);
      if (!localFilePath.startsWith(this.localStorageDir)) {
        throw new Error('Path traversal attempt detected');
      }
      this.ensureLocalStorageDir(localFilePath);
      await fs.promises.writeFile(localFilePath, buffer);
      this.logger.log(`[Disk Storage] Stored real evidence file (${buffer.length} bytes): ${localFilePath}`);
      return `file://${localFilePath.replace(/\\/g, '/')}`;
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
      const localFilePath = path.resolve(this.localStorageDir, objectName);
      if (!localFilePath.startsWith(this.localStorageDir)) {
        throw new Error('Path traversal attempt detected');
      }
      if (fs.existsSync(localFilePath)) {
        return await fs.promises.readFile(localFilePath);
      }
      throw new Error(`Evidence file ${objectName} not found on disk`);
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
    if (!this.isOnline) {
      const localFilePath = path.join(this.localStorageDir, objectName);
      if (fs.existsSync(localFilePath)) {
        await fs.promises.unlink(localFilePath);
        this.logger.log(`Deleted local evidence file: ${localFilePath}`);
      }
      return;
    }
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
      this.logger.log(`Deleted object ${objectName} from MinIO`);
    } catch (error: any) {
      this.logger.error(`Failed to delete object ${objectName} from MinIO`, error);
    }
  }
}
