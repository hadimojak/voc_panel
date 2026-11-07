import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const SORT_FIELDS = [
  'id',
  'createdAt',
  'type',
  'mobile',
  'nationalId',
  'subject1',
  'subject2',
  'followUpOwner',
  'subject3',
  'branch',
  'complaintOwner',
  'channel',
  'sentiment',
  'priority',
] as const;

export class ListTicketsDto {
  /** Used by `/ticket/adjacent` — ignored by list. */
  @ApiPropertyOptional({ example: '8993822' })
  @IsOptional()
  @IsString()
  id?: string;

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

  @ApiPropertyOptional({
    description: 'CRM status, SMART status, or KPI group open|inReview|closed',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject3?: string;

  @ApiPropertyOptional({ enum: ['positive', 'neutral', 'negative'] })
  @IsOptional()
  @IsIn(['positive', 'neutral', 'negative'])
  sentiment?: 'positive' | 'neutral' | 'negative';

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'] })
  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @ApiPropertyOptional({ description: 'createdtime >= from (ISO)' })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({ description: 'createdtime <= to (ISO)' })
  @IsOptional()
  @IsISO8601()
  to?: string;

  @ApiPropertyOptional({ enum: SORT_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(SORT_FIELDS as unknown as string[])
  sort?: (typeof SORT_FIELDS)[number] = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  dir?: 'asc' | 'desc' = 'desc';
}
