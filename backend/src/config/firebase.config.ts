import { Injectable, Logger } from '@nestjs/common';
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

@Injectable()
export class FirebaseService {
  private fcm: Messaging | null = null;
  private readonly logger = new Logger(FirebaseService.name);

  constructor() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn('Firebase not configured — push notifications disabled');
      return;
    }

    try {
      if (!getApps().length) {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          } as any),
        });
      }
      this.fcm = getMessaging();
    } catch (error) {
      this.logger.error(`Firebase init failed: ${error}`);
    }
  }

  async sendToDevice(token: string, title: string, body: string, data?: Record<string, string>): Promise<void> {
    if (!this.fcm) return;
    try {
      await this.fcm.send({ token, notification: { title, body }, data });
    } catch (error) {
      this.logger.error(`FCM send error: ${error}`);
    }
  }

  async sendToMultipleDevices(tokens: string[], title: string, body: string, data?: Record<string, string>): Promise<void> {
    if (!this.fcm) return;
    try {
      await this.fcm.sendEachForMulticast({ tokens, notification: { title, body }, data });
    } catch (error) {
      this.logger.error(`FCM multicast error: ${error}`);
    }
  }
}
