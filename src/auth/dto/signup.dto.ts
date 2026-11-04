import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../user/user.entity';
import { IsIranMobile } from '../../common/validators/mobile.validator';

export class SignupDto {
  @ApiProperty({ example: 'سارا احمدی' })
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @ApiProperty({ example: '09121234567' })
  @IsNotEmpty()
  @IsString()
  @IsIranMobile()
  mobile!: string;

  @ApiProperty({
    description: 'Password must be at least 6 characters long',
    example: '123456',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ example: 'sara@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.agent })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: 'ارزیابی جبران' })
  @IsOptional()
  @IsString()
  team?: string;
}
