import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

const SORT_FIELDS = [
  'startedAt',
  'durationSec',
  'waitSec',
  'status',
  'agent',
] as const;

export class ListCallsDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_000)
  pageSize?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['ringing', 'ongoing', 'answered', 'missed'] })
  @IsOptional()
  @IsIn(['ringing', 'ongoing', 'answered', 'missed'])
  status?: string;

  @ApiPropertyOptional({ enum: ['inbound', 'outbound'] })
  @IsOptional()
  @IsIn(['inbound', 'outbound'])
  direction?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  agent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  queue?: string;

  @ApiPropertyOptional({ enum: ['positive', 'neutral', 'negative'] })
  @IsOptional()
  @IsIn(['positive', 'neutral', 'negative'])
  sentiment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  uncategorizedOnly?: boolean;

  @ApiPropertyOptional({ enum: SORT_FIELDS, default: 'startedAt' })
  @IsOptional()
  @IsIn(SORT_FIELDS as unknown as string[])
  sort?: (typeof SORT_FIELDS)[number] = 'startedAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  dir?: 'asc' | 'desc' = 'desc';
}
