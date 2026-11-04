import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { normalizeOpenEnumValue } from '../../common/types/open-enum';
import { IsOpenEnum } from '../../common/validators/is-open-enum.validator';
import {
  ComplaintCause,
  ComplaintType,
  MainComplaintType,
  TicketPriority,
  TicketSentiment,
  TicketStatus,
  TicketType,
} from '../enums/ticket.enums';

const toOpenEnumOrNull = ({ value }: { value: unknown }) =>
  normalizeOpenEnumValue(value);

/**
 * Partial ticket write shape for imports / upserts.
 * Open-enum fields accept known values *and* any other string so CRM drift
 * never fails class-validator (do not use `@IsEnum` on these fields).
 */
export class UpsertTicketDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ticketid?: string;

  @ApiPropertyOptional({ enum: TicketType })
  @IsOptional()
  @Transform(toOpenEnumOrNull)
  @IsOpenEnum(TicketType)
  tickettype?: string | null;

  @ApiPropertyOptional({ enum: TicketStatus })
  @IsOptional()
  @Transform(toOpenEnumOrNull)
  @IsOpenEnum(TicketStatus)
  complaintstatus?: string | null;

  @ApiPropertyOptional({
    enum: MainComplaintType,
    description: 'نوع اصلی شکایت',
  })
  @IsOptional()
  @Transform(toOpenEnumOrNull)
  @IsOpenEnum(MainComplaintType)
  maincomplaint?: string | null;

  @ApiPropertyOptional({
    enum: MainComplaintType,
    description: 'موضوع اصلی (هم‌تراز نوع اصلی شکایت)',
  })
  @IsOptional()
  @Transform(toOpenEnumOrNull)
  @IsOpenEnum(MainComplaintType)
  mainticket?: string | null;

  @ApiPropertyOptional({ enum: ComplaintType, description: 'نوع شکایت' })
  @IsOptional()
  @Transform(toOpenEnumOrNull)
  @IsOpenEnum(ComplaintType)
  subticket?: string | null;

  @ApiPropertyOptional({ enum: ComplaintCause, description: 'علت شکایت' })
  @IsOptional()
  @Transform(toOpenEnumOrNull)
  @IsOpenEnum(ComplaintCause)
  reqtypeticket?: string | null;

  @ApiPropertyOptional({ enum: TicketSentiment, description: 'احساس' })
  @IsOptional()
  @Transform(toOpenEnumOrNull)
  @IsOpenEnum(TicketSentiment)
  sentiment?: string | null;

  @ApiPropertyOptional({ enum: TicketPriority, description: 'اولویت' })
  @IsOptional()
  @Transform(toOpenEnumOrNull)
  @IsOpenEnum(TicketPriority)
  priority?: string | null;
}
