import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'current_password must not be empty' })
  current_password!: string;

  @IsString()
  @IsNotEmpty({ message: 'new_password must not be empty' })
  @MinLength(8, { message: 'new_password must be at least 8 characters long' })
  @MaxLength(128, { message: 'new_password must be at most 128 characters' })
  new_password!: string;
}
