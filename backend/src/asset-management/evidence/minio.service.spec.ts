import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MinioService } from './minio.service';
import * as fs from 'fs';
import * as path from 'path';

describe('MinioService (Resilient Storage with Local Fallback)', () => {
  let service: MinioService;
  const testDir = path.resolve(process.cwd(), 'storage/evidence');
  const testFileName = 'test-doc-001.pdf';
  const testFilePath = path.join(testDir, testFileName);

  beforeEach(() => {
    service = new MinioService();
    // Simulate MinIO server down so it operates in resilient disk-backed fallback mode
    (service as any).isOnline = false;
  });

  afterEach(async () => {
    if (fs.existsSync(testFilePath)) {
      await fs.promises.unlink(testFilePath);
    }
  });

  it('should store files to local disk when MinIO is unavailable', async () => {
    const fileContent = Buffer.from('DEFENCE_EQUIPMENT_SPECIFICATION_V1');
    const resultUri = await service.uploadFile(testFileName, fileContent);

    expect(resultUri).toContain('file://');
    expect(fs.existsSync(testFilePath)).toBe(true);

    const readData = await fs.promises.readFile(testFilePath);
    expect(readData.toString()).toBe('DEFENCE_EQUIPMENT_SPECIFICATION_V1');
  });

  it('should retrieve stored files from disk fallback', async () => {
    const fileContent = Buffer.from('CALIBRATION_CERT_BEL_2026');
    await service.uploadFile(testFileName, fileContent);

    const downloadedBuffer = await service.downloadFile(testFileName);
    expect(downloadedBuffer.toString()).toBe('CALIBRATION_CERT_BEL_2026');
  });

  it('should throw error when downloading non-existent file on disk', async () => {
    await expect(service.downloadFile('non-existent-file.bin')).rejects.toThrow(
      'Evidence file non-existent-file.bin not found on disk',
    );
  });

  it('should delete file from disk fallback', async () => {
    const fileContent = Buffer.from('TEMPORARY_LOG');
    await service.uploadFile(testFileName, fileContent);
    expect(fs.existsSync(testFilePath)).toBe(true);

    await service.deleteFile(testFileName);
    expect(fs.existsSync(testFilePath)).toBe(false);
  });
});
