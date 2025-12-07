import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StarwarsService } from './starwars.service';
import { StarwarsController } from './starwars.controller';

@Module({
  imports: [HttpModule],
  controllers: [StarwarsController],
  providers: [StarwarsService],
})
export class StarwarsModule { }
