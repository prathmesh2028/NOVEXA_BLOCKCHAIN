import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'email must be a string' })
  @IsNotEmpty({ message: 'email must not be empty' })
  @MaxLength(254, { message: 'email must be at most 254 characters' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'password must not be empty' })
  @MaxLength(128, { message: 'password must be at most 128 characters' })
  password!: string;
}
