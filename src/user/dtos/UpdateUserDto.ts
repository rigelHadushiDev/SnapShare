import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, IsBoolean, MaxLength, IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class UpdateUserDto {

  @ApiProperty({
    description: 'Profile description of the user',
    example: 'This is my profile description.',
  })
  @IsString()
  @MinLength(1)
  @IsOptional()
  profileDescription?: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  lastName?: string;

  @ApiProperty({
    description: 'Indicates if the user profile is private',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(12)
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsOptional()
  @MinLength(4)
  email?: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'Password123',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*\d)(?=.*[A-Z])/, {
    message: 'Password must contain at least one number and one uppercase letter',
  })
  password?: string;
}