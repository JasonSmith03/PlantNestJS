import { Controller, Get, Post, Body } from '@nestjs/common';
import { MoistureDataService } from './moisture-data.service';

@Controller('moisture')
export class MoistureDataController {
  constructor(private readonly moistureDataService: MoistureDataService) {}

  @Post()
  async saveMoistureData(
    @Body() data: { name: string; moisture_pct: number; status_msg: string },
  ) {
    await this.moistureDataService.saveMoistureData(data);
    return { message: 'Data saved successfully.' };
  }

  @Get()
  async getAllMoistureData() {
    return this.moistureDataService.getAllMoistureData();
  }
}
