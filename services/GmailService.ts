import { APIRequestContext } from '@playwright/test';

export class GmailService {
  private static readonly API = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';

  constructor(
    private readonly request: APIRequestContext,
    private readonly accessToken: string,
  ) {}

  static extractOtp(text: string | null | undefined): string {
    if (!text) return '';
    const match = text.match(/\b(\d{4})\b/);
    return match ? match[1] : '';
  }

  private assertToken(): void {
    if (!this.accessToken) {
      throw new Error('GMAIL_ACCESS_TOKEN environment variable is not set');
    }
  }

  private get authHeader(): Record<string, string> {
    return { Authorization: `Bearer ${this.accessToken}` };
  }

  private async latestMessageId(): Promise<string | null> {
    const res = await this.request.get(GmailService.API, { headers: this.authHeader });
    if (!res.ok()) {
      throw new Error(`Gmail API error: ${res.status()} ${res.statusText()}`);
    }
    const body = await res.json();
    return body.messages?.[0]?.id ?? null;
  }

  async readLatestSnippet(): Promise<string | null> {
    this.assertToken();
    const id = await this.latestMessageId();
    if (!id) {
      throw new Error('Failed to get message ID from Gmail - check if GMAIL_ACCESS_TOKEN has proper permissions');
    }
    const res = await this.request.get(`${GmailService.API}/${id}`, { headers: this.authHeader });
    if (!res.ok()) {
      throw new Error(`Gmail API error: ${res.status()} ${res.statusText()}`);
    }
    const body = await res.json();
    return body.snippet ?? null;
  }

  async currentOtp(): Promise<string> {
    const snippet = await this.readLatestSnippet(); // no silent .catch() — real errors surface now
    return GmailService.extractOtp(snippet);
  }

  async waitForNewOtp(
    previousOtp: string,
    { attempts = 10, intervalMs = 1000 }: { attempts?: number; intervalMs?: number } = {},
  ): Promise<string> {
    for (let i = 0; i < attempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      const otp = await this.currentOtp();
      if (otp && otp !== previousOtp) return otp;
    }
    throw new Error(`No new OTP arrived within ${(attempts * intervalMs) / 1000}s.`);
  }
}