import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetScenarioActiveDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  active!: boolean;
}
