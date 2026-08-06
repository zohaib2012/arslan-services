import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Post()
  async add(
    @CurrentUser('id') userId: string,
    @Body('workerId') workerId: string,
  ) {
    return this.favoritesService.add(userId, workerId);
  }

  @Delete(':workerId')
  async remove(
    @CurrentUser('id') userId: string,
    @Param('workerId') workerId: string,
  ) {
    return this.favoritesService.remove(userId, workerId);
  }

  @Get()
  async myFavorites(@CurrentUser('id') userId: string) {
    return this.favoritesService.myFavorites(userId);
  }

  @Get('check/:workerId')
  async check(
    @CurrentUser('id') userId: string,
    @Param('workerId') workerId: string,
  ) {
    return this.favoritesService.check(userId, workerId);
  }
}
