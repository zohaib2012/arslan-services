import { Controller, Get, Param, Query } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('api/services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Get()
  async findAll(@Query('categoryId') categoryId?: string) {
    return this.servicesService.findAll(categoryId);
  }

  @Get('search')
  async search(@Query('q') q: string) {
    return this.servicesService.search(q);
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string) {
    return this.servicesService.findByCategory(categoryId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }
}
