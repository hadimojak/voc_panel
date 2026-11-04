import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../user.entity';
import { IsIranMobile } from '../../common/validators/mobile.validator';

export class CreateUserDto {
  @ApiProperty({ example: 'سارا احمدی' })
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @ApiProperty({ example: '09121234567' })
  @IsNotEmpty()
  @IsString()
  @IsIranMobile()
  mobile!: string;

  @ApiProperty({ example: '123456', minLength: 6 })
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

  @ApiProperty({ example: 'ارزیابی جبران' })
  @IsNotEmpty()
  @IsString()
  team!: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
