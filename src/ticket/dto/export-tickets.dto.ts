import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray } from 'class-validator';

export class ExportTicketsDto {
  @ApiProperty({
    type: [String],
    example: ['1000001', '1000002'],
    description: 'Selected ticket IDs to export.',
  })
  @IsArray()
  @ArrayNotEmpty()
  ticketIds!: Array<string>;
}
