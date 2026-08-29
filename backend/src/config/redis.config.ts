import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
      tls: process.env.REDIS_URL?.includes('upstash') ? {} : undefined,
    });
    this.redis.on('error', (err) => {
      console.error('Redis connection error:', (err as Error)?.message || err);
    });
  }

  getClient(): Redis {
    return this.redis;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, 'EX', ttl);
    } else {
      await this.redis.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const stream = this.redis.scanStream({ match: pattern, count: 100 });
    const keys: string[] = [];
    await new Promise<void>((resolve, reject) => {
      stream.on('data', (batch: string[]) => keys.push(...batch));
      stream.on('end', () => resolve());
      stream.on('error', reject);
    });
    if (keys.length) await this.redis.del(...keys);
  }

  async remember<T>(key: string, ttl: number, fetch: () => Promise<T>): Promise<T> {
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        try { return JSON.parse(cached); } catch { /* ignore corrupted */ }
      }
    } catch { /* redis down — fall through to DB */ }

    const value = await fetch();
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch { /* redis down — skip caching */ }
    return value;
  }
}
