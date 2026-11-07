import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  Max,
  Min,
} from 'class-validator';

/** Full replace of SystemSettings — same shape as smart-dashboard. */
export class UpdateSettingsDto {
  @ApiProperty({ example: 7, minimum: 1, maximum: 60 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(60)
  slaDays!: number;

  @ApiProperty({ example: 20, minimum: 10, maximum: 200 })
  @Type(() => Number)
  @IsNumber()
  @Min(10)
  @Max(200)
  defaultPageSize!: number;

  @ApiProperty({ example: 0.3, minimum: 0.05, maximum: 0.95 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.05)
  @Max(0.95)
  negativeSentimentAlert!: number;

  @ApiProperty({ example: 3, minimum: 2, maximum: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(2)
  @Max(20)
  repeatCallThreshold!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  incomingCallPopup!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  autoTagging!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  transcription!: boolean;

  @ApiProperty({ example: 365, minimum: 30, maximum: 3650 })
  @Type(() => Number)
  @IsNumber()
  @Min(30)
  @Max(3650)
  voiceRetentionDays!: number;
}
