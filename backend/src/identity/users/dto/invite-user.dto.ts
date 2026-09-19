import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { AppRole } from '@prisma/client';

export class InviteUserDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(254, { message: 'email must be at most 254 characters' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'name must not be empty' })
  @MinLength(2, { message: 'name must be at least 2 characters long' })
  @MaxLength(100, { message: 'name must be at most 100 characters' })
  name!: string;

  @IsEnum(AppRole, {
    message: `role must be one of the valid system roles: ${Object.values(AppRole).join(', ')}`,
  })
  role!: AppRole;
}
