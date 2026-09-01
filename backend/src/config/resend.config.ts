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
    const { error } = await this.resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Easyservice <noreply@easyservice.tech>',
      to,
      subject,
      html,
    });
    if (error) this.logger.error(`Resend sendEmail failed: ${JSON.stringify(error)}`);
  }

  async sendOtpEmail(to: string, otp: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured — cannot send email OTP');
      return;
    }
    const { data, error } = await this.resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Easyservice <noreply@easyservice.tech>',
      to,
      subject: 'Your Easyservice Admin Login OTP',
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
          <h2 style="margin:0 0 8px;color:#006837">Easyservice Admin Login</h2>
          <p style="color:#555;margin:0 0 16px">Use the OTP below to verify your identity. It expires in <strong>5 minutes</strong>.</p>
          <div style="font-size:34px;font-weight:800;letter-spacing:8px;color:#006837;background:#f0faf4;border:1px solid #d6e8dc;padding:18px;border-radius:10px;text-align:center;margin:0 0 16px">${otp}</div>
          <p style="color:#999;font-size:12px;margin:0">If you didn't request this, you can safely ignore this email.</p>
        </div>`,
    });
    if (error) {
      this.logger.error(`Resend OTP email failed: ${JSON.stringify(error)}`);
      throw new Error('Resend OTP email failed');
    }
  }
}
