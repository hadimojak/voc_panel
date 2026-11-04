import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsIranMobile } from '../../common/validators/mobile.validator';

export class LoginDto {
  @ApiProperty({
    description: 'Iranian mobile number (Latin digits)',
    example: '09121234567',
  })
  @IsNotEmpty()
  @IsString()
  @IsIranMobile()
  mobile!: string;

  @ApiProperty({
    description: 'User password',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
