import { IsString, IsOptional, MinLength, IsBoolean, MaxLength, IsEmail } from 'class-validator';

export class UpdateUserDto {

  @IsString()
  @MinLength(1)
  @MinLength(200)
  @IsOptional()
  profileDescription?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsString()
  @MinLength(1)
  @MaxLength(12)
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
