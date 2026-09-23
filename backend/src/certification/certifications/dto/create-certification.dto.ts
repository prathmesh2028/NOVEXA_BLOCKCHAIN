import { IsString, IsOptional } from 'class-validator';

export class CreateCertificationDto {
  @IsString()
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
