import { IsEmail, IsIn, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class InviteUserDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(254, { message: 'email must be at most 254 characters' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'name must not be empty' })
  @MinLength(2, { message: 'name must be at least 2 characters long' })
  @MaxLength(100, { message: 'name must be at most 100 characters' })
  name!: string;

  @IsIn(['SYSTEM_ADMIN', 'PROCUREMENT_SUPPLY_CHAIN_OFFICER', 'QUALITY_INSPECTOR', 'AUDITOR'], {
    message: 'role must be one of: SYSTEM_ADMIN, PROCUREMENT_SUPPLY_CHAIN_OFFICER, QUALITY_INSPECTOR, AUDITOR',
  })
  role!: string;
}
