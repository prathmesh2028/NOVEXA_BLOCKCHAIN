import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateCertificationDto {
  @IsString()
  @IsUUID()
  asset_id!: string;

  @IsString()
  @IsOptional()
  batch_id?: string;
}
