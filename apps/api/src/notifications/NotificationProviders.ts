export interface EmailProvider {
  sendEmail(to: string, subject: string, body: string, isHtml?: boolean): Promise<boolean>;
}

export interface SMSProvider {
  sendSMS(to: string, message: string): Promise<boolean>;
}

export interface WhatsAppProvider {
  sendWhatsAppMessage(to: string, message: string): Promise<boolean>;
}

export interface PushProvider {
  sendPushNotification(token: string, title: string, body: string): Promise<boolean>;
}
