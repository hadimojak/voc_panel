import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
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

const emptyToNull = ({ value }: { value: unknown }) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
};

/**
 * CRM ticket write shape for imports / upserts.
 * Field names match the CRM payload / tickets table columns exactly.
 * Open-enum fields accept known values *and* any other string so CRM drift
 * never fails class-validator (do not use `@IsEnum` on these fields).
 */
export class UpsertTicketDto {
  @ApiPropertyOptional({ example: '7998146' })
  @IsOptional()
  @IsString()
  ticketid?: string;

  @ApiPropertyOptional({ example: 'TT1065189' })
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  ticket_no?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  nationalcode?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  accountname?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  fname?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  lname?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  mobile?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  productname?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  branchname?: string | null;

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

  @ApiPropertyOptional({ example: '2024-07-27 18:39:08' })
  @IsOptional()
  @Transform(emptyToNull)
  createdtime?: string | Date | null;

  @ApiPropertyOptional({ example: '2024-07-30 13:14:01' })
  @IsOptional()
  @Transform(emptyToNull)
  modifiedtime?: string | Date | null;

  @ApiPropertyOptional({ enum: TicketType })
  @IsOptional()
  @Transform(toOpenEnumOrNull)
  @IsOpenEnum(TicketType)
  tickettype?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  inputchannel?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  complainttext?: string | null;

  @ApiPropertyOptional({
    enum: MainComplaintType,
    description: 'نوع اصلی شکایت',
  })
  @IsOptional()
  @Transform(toOpenEnumOrNull)
  @IsOpenEnum(MainComplaintType)
  maincomplaint?: string | null;

  @ApiPropertyOptional({ enum: TicketStatus })
  @IsOptional()
  @Transform(toOpenEnumOrNull)
  @IsOpenEnum(TicketStatus)
  complaintstatus?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  finalanswer?: string | null;

  @ApiPropertyOptional({ example: '2024-11-02' })
  @IsOptional()
  @Transform(emptyToNull)
  closeddate?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  mainrequest?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  mainoffer?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  ownername?: string | null;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lat?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lng?: number | null;
}
