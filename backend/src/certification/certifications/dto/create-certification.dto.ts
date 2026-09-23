import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateCertificationDto {
  @IsString()
  @IsUUID()
  asset_id!: string;

  @IsString()
  @IsOptional()
  batch_id?: string;

  @IsString()
  @IsOptional()
  certificate_image?: string;

  @IsString()
  @IsOptional()
  image_name?: string;
}
