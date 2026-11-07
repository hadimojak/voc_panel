import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class StartCrmSyncDto {
  @ApiPropertyOptional({
    description:
      'Ignored for windowing — every sync already starts from (now - 1 year) and purges older tickets first',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  reset?: boolean;
}
