import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private ai: GoogleGenerativeAI;

  constructor() {
    this.ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async search(query: string, location?: string): Promise<any> {
    const model = this.ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `You are a home services assistant for Pakistan. Extract: service_type, location, urgency from query.

Query: "${query}"
${location ? `Detected location: ${location}` : ''}
Respond in JSON: {"service":"detected name","location":"detected or null","urgency":"normal"or"emergency","followup_question":"ask if more info needed or null"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try { return JSON.parse(text || '{}'); } catch { return { followup_question: 'Could you specify what service you need?' }; }
  }

  async chat(message: string, history: string[] = []): Promise<string> {
    const model = this.ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `You are a home services assistant for Pakistan. Be friendly and helpful.
Previous: ${history.join('\n')}
Customer: ${message}
Assistant:`;
    const result = await model.generateContent(prompt);
    return result.response.text() || 'I did not understand. Could you repeat?';
  }
}
