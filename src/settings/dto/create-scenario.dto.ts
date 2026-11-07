import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateScenarioDto {
  @ApiProperty({ example: 'پیگیری فوری پرونده خسارت' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'ارجاع پرونده معطل به کارشناس خسارت' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'پس از صدور' })
  @IsOptional()
  @IsString()
  triggerSubject?: string;

  @ApiPropertyOptional({ example: ['خسارت', 'تاخیر'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}
