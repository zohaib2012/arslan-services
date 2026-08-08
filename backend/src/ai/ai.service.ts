import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/database.config';
import { GeminiService } from '../config/gemini.config';

@Injectable()
export class AiAssistantService {
  constructor(
    private prisma: PrismaService,
    private gemini: GeminiService,
  ) {}

  async search(query: string, location?: string): Promise<any> {
    const q = (query || '').trim();
    if (!q) {
      return { service: null, location: location || null, urgency: 'normal', followup_question: 'What service do you need?' };
    }

    if (this.gemini.isAvailable()) {
      try {
        return await this.gemini.search(q, location);
      } catch {
        // Gemini unreachable or key invalid — fall through to keyword matching
      }
    }

    return this.matchByKeywords(q, location);
  }

  async chat(message: string, history: string[] = []): Promise<string> {
    if (this.gemini.isAvailable()) {
      try {
        return await this.gemini.chat(message, history);
      } catch {
        // Gemini unreachable or key invalid — fall back to keyword reply
      }
    }
    return this.keywordReply(message);
  }

  private async matchByKeywords(query: string, location?: string): Promise<any> {
    const services = await this.prisma.service.findMany({
      where: { isActive: true },
      select: { id: true, nameEn: true, nameUr: true, slug: true },
    });

    const q = query.toLowerCase();

    const synonyms: Record<string, string[]> = {
      plumber: ['plumb', 'pipe', 'tap', 'leak', 'drain', 'faucet', 'sink', 'water'],
      electrician: ['electric', 'wire', 'switch', 'fan', 'inverter', 'solar', 'meter', 'power'],
      'ac repair': ['ac', 'air condition', 'cooling', 'aircon'],
      cleaning: ['clean', 'sweep', 'maid', 'housekeep', 'dust'],
      painter: ['paint', 'wall paint', 'color'],
      carpenter: ['carpenter', 'wood', 'furniture', 'door'],
      mechanic: ['mechanic', 'vehicle', 'car', 'bike'],
      welder: ['weld', 'grill'],
      'gas technician': ['gas', 'stove', 'cylinder', 'refill'],
      handyman: ['repair', 'fix', 'install', 'service', 'setup', 'maintenance'],
    };

    // Direct match against service names
    let matched = services.find(
      (s) => q.includes(s.nameEn.toLowerCase()) || q.includes(s.slug.toLowerCase()),
    );

    // Synonym category match -> find a service whose category matches
    if (!matched) {
      for (const [cat, words] of Object.entries(synonyms)) {
        if (words.some((w) => q.includes(w))) {
          const catServices = await this.prisma.service.findMany({
            where: {
              isActive: true,
              category: { nameEn: { contains: cat, mode: 'insensitive' } },
            },
            select: { id: true, nameEn: true, nameUr: true, slug: true },
            take: 1,
          });
          if (catServices.length > 0) {
            matched = catServices[0];
          }
          break;
        }
      }
    }

    const urgency = /emergency|urgent|asap|immediately|jaldi/.test(q) ? 'emergency' : 'normal';

    if (matched) {
      return {
        service: matched.nameEn,
        location: location || null,
        urgency,
        followup_question: null,
      };
    }

    return {
      service: query,
      location: location || null,
      urgency,
      followup_question: 'Could you specify what service you need?',
    };
  }

  private keywordReply(message: string): string {
    const q = message.toLowerCase();
    if (/emergency|urgent|asap|immediately|jaldi/.test(q)) {
      return 'This looks urgent! I would recommend booking an Emergency service so a worker is assigned as soon as possible. Which city are you in?';
    }
    if (/hi|hello|salam|hey/.test(q)) {
      return 'Hello! How can I help you? You can tell me what home service you need (e.g. "I need a plumber") and I will find workers for you.';
    }
    if (/thank|shukriya/.test(q)) {
      return 'You are welcome! If you need anything else, just ask.';
    }
    if (/price|cost|rate|kitna/.test(q)) {
      return 'Prices depend on the service and location. Once you create a booking, workers can share an estimated price before starting.';
    }
    return 'I can help you find a home service worker. Tell me what you need, for example: "plumber for a leaking tap" or "AC repair in Lahore".';
  }
}
