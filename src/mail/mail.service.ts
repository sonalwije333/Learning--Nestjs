import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly isDev: boolean;

  constructor(private configService: ConfigService) {
    this.isDev = this.configService.get('NODE_ENV') !== 'production';

    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASSWORD');

    if (!smtpHost || smtpHost === 'smtp.example.com') {
      this.logger.warn('SMTP not configured — emails will be skipped in dev mode.');
      return; // No transporter → skip sending
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const url = `${frontendUrl}/verify-email?token=${token}`;

    await this.sendMail({
      to: email,
      subject: 'Email Verification',
      html: `<p>Please click the link below to verify your email:</p>
             <a href="${url}">${url}</a>`,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const url = `${frontendUrl}/reset-password?token=${token}`;

    await this.sendMail({
      to: email,
      subject: 'Password Reset',
      html: `<p>Please click the link below to reset your password:</p>
             <a href="${url}">${url}</a>
             <p>This link will expire in 1 hour.</p>`,
    });
  }

  private async sendMail(options: { to: string; subject: string; html: string }) {
    if (!this.transporter) {
      if (this.isDev) {
        this.logger.log(`[DEV MODE] Email to ${options.to} skipped. Subject: ${options.subject}`);
        return;
      }
      this.logger.error('SMTP transporter not configured. Email not sent.');
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM'),
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (this.isDev) {
        this.logger.log(`Email sent (MessageId: ${info.messageId})`);
        if (nodemailer.getTestMessageUrl(info)) {
          this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
    }
  }
}
