import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class StartCrmSyncDto {
  @ApiPropertyOptional({
    description:
      'When true, reset last_ticketid in the JSON cursor back to CRM_INITIAL_LAST_TICKETID before syncing',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  reset?: boolean;
}
