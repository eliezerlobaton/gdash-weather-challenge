import { Controller, Get, Param, Query } from '@nestjs/common';
import { StarwarsService } from './starwars.service';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Star Wars')
@Controller('starwars')
export class StarwarsController {
  constructor(private readonly starwarsService: StarwarsService) { }

  @Get(':category')
  @ApiOperation({ summary: 'List entities by category (people, planets, etc.)' })
  @ApiParam({ name: 'category', enum: ['people', 'planets', 'vehicles', 'species', 'locations', 'organizations'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Param('category') category: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.starwarsService.findAll(category, page, limit);
  }

  @Get(':category/:id')
  @ApiOperation({ summary: 'Get entity details by ID' })
  @ApiParam({ name: 'category', enum: ['people', 'planets', 'vehicles', 'species', 'locations', 'organizations'] })
  findOne(
    @Param('category') category: string,
    @Param('id') id: string,
  ) {
    return this.starwarsService.findOne(category, id);
  }
}
