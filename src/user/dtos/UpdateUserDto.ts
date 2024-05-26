import { IsString, IsOptional, MinLength, IsBoolean, MaxLength, IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {

  @IsString()
  @MinLength(1)
  @MinLength(200)
  @IsOptional()
  profileDescription?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  lastName?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsString()
  @MinLength(1)
  @MaxLength(12)
  @IsOptional()
  @MinLength(1)
  username?: string;

  @IsEmail()
  @IsOptional()
  @MinLength(4)
  email?: string;
}
