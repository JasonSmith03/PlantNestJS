import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { MoistureDataController } from './moisture-data.controller';
import { MoistureDataService } from './moisture-data.service';

@Module({
  controllers: [MoistureDataController],
  providers: [KafkaService, MoistureDataService],
})
export class AppModule {}
