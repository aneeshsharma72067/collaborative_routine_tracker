import { Controller, Get } from '@nestjs/common';
import { MetaService } from './meta.service';

@Controller('api/meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Get('timezones')
  timezones() {
    return this.metaService.getTimezones();
  }
}
