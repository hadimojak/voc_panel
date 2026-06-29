import { IsNumber, IsString } from 'class-validator';

export class RefreshDto {
  @IsNumber()
  userId!: number;

  @IsString()
  refreshToken!: string;
}
