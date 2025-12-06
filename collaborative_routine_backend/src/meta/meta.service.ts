import { Injectable } from '@nestjs/common';

@Injectable()
export class MetaService {
  getTimezones() {
    return Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [];
  }
}
