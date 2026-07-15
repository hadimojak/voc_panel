import { Body, Controller, Post } from '@nestjs/common';
import { SupersetService } from './superset.service';

@Controller('superset')
export class SupersetController {
  constructor(private readonly supersetService: SupersetService) {}

  @Post('guest-token')
  async getGuestToken(@Body() body: { dashboardId: string }) {
    const token = await this.supersetService.getGuestToken(body.dashboardId);
    return { token };
  }
}
