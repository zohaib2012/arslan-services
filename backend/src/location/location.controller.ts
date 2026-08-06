import { Controller, Get, Query } from '@nestjs/common';

@Controller('api/location')
export class LocationController {
  private readonly accessToken = process.env.MAPBOX_ACCESS_TOKEN || '';
  private readonly baseUrl = 'https://api.mapbox.com';

  @Get('geocode')
  async geocode(@Query('q') query: string) {
    try {
      if (!query) return { results: [] };

      const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${this.accessToken}&country=pk&limit=5`;
      const res = await fetch(url);
      const data = await res.json();

      return {
        results: (data.features || []).map((f: any) => ({
          id: f.id,
          name: f.place_name,
          center: f.center,
          type: f.place_type?.[0],
        })),
      };
    } catch {
      return { results: [] };
    }
  }

  @Get('reverse-geocode')
  async reverseGeocode(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ) {
    try {
      if (!lat || !lng) return { results: [] };

      const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.accessToken}&types=address,place,locality`;
      const res = await fetch(url);
      const data = await res.json();

      return {
        results: (data.features || []).map((f: any) => ({
          id: f.id,
          name: f.place_name,
          center: f.center,
          type: f.place_type?.[0],
        })),
      };
    } catch {
      return { results: [] };
    }
  }

  @Get('autocomplete')
  async autocomplete(@Query('q') query: string) {
    try {
      if (!query) return { results: [] };

      const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${this.accessToken}&country=pk&types=address,place,locality,neighborhood&autocomplete=true&limit=5`;
      const res = await fetch(url);
      const data = await res.json();

      return {
        results: (data.features || []).map((f: any) => ({
          id: f.id,
          name: f.place_name,
          center: f.center,
          type: f.place_type?.[0],
        })),
      };
    } catch {
      return { results: [] };
    }
  }
}
