import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private ai: GoogleGenerativeAI;
  private apiKeyValid = false;

  constructor() {
    const key = process.env.GEMINI_API_KEY || '';
    this.apiKeyValid = key.length > 20;
    this.ai = new GoogleGenerativeAI(key);
  }

  isAvailable() {
    return this.apiKeyValid;
  }

  private readonly modelName = 'gemini-3-flash-preview';

  async search(query: string, location?: string): Promise<any> {
    if (!this.apiKeyValid) {
      throw new Error('GEMINI_KEY_INVALID');
    }
    const model = this.ai.getGenerativeModel({ model: this.modelName });
    const prompt = `You are a home services assistant for Pakistan. Extract: service_type, location, urgency from query.

Query: "${query}"
${location ? `Detected location: ${location}` : ''}
Respond in JSON: {"service":"detected name","location":"detected or null","urgency":"normal"or"emergency","followup_question":"ask if more info needed or null"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try {
      const cleaned = text.replace(/```json|```/g, '').trim();
      const json = cleaned.substring(cleaned.indexOf('{'), cleaned.lastIndexOf('}') + 1);
      return JSON.parse(json || '{}');
    } catch { return { followup_question: 'Could you specify what service you need?' }; }
  }

  async chat(message: string, history: string[] = []): Promise<string> {
    if (!this.apiKeyValid) {
      throw new Error('GEMINI_KEY_INVALID');
    }
    const model = this.ai.getGenerativeModel({ model: this.modelName });
    const prompt = `You are a home services assistant for Pakistan. Be friendly and helpful.
Previous: ${history.join('\n')}
Customer: ${message}
Assistant:`;
    const result = await model.generateContent(prompt);
    return result.response.text() || 'I did not understand. Could you repeat?';
  }
}
