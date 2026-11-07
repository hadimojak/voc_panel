import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class StartCrmSyncDto {
  @ApiPropertyOptional({
    description:
      'Reset cursor to CRM_INITIAL_LAST_MODIFIED / CRM_INITIAL_LAST_TICKETID before syncing',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  reset?: boolean;
}
