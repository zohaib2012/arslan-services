import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class ResendService {
  private resend: Resend | null = null;
  private readonly logger = new Logger(ResendService.name);

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn('Resend API key not configured — email/OTP disabled');
      return;
    }
    this.resend = new Resend(apiKey);
  }

  async sendOTP(phone: string, otp: string): Promise<void> {
    console.log(`OTP for ${phone}: ${otp}`);
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) return;
    await this.resend.emails.send({
      from: 'Arslan Services <noreply@yourdomain.com>',
      to,
      subject,
      html,
    });
  }
}
