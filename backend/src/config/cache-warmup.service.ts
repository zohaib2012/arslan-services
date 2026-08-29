import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from './redis.config';
import { CategoriesService } from '../categories/categories.service';
import { ServicesService } from '../services/services.service';
import { WorkersService } from '../workers/workers.service';

@Injectable()
export class CacheWarmupService implements OnModuleInit {
  constructor(
    private redis: RedisService,
    private categories: CategoriesService,
    private services: ServicesService,
    private workers: WorkersService,
  ) {}

  onModuleInit() {
    setTimeout(() => {
      void this.warm();
    }, 3000);
  }

  async warm() {
    try {
      if (!(await this.redis.get('cache:categories'))) await this.categories.findAll();
      if (!(await this.redis.get('cache:services:all'))) await this.services.findAll();
      if (!(await this.redis.get('cache:workers:top12'))) {
        await this.workers.getWorkers({ page: 1, limit: 12 });
      }
      console.log('🔥 Public API cache pre-warmed');
    } catch (err) {
      console.error('Cache warmup failed:', (err as Error)?.message || err);
    }
  }
}
