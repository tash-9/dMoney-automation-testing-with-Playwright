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
      throw new Error('GMAIL_ACCESS_TOKEN is not set. See README.md for how to generate one.');
    }
  }

  private get authHeader(): Record<string, string> {
    return { Authorization: `Bearer ${this.accessToken}` };
  }

  private async latestMessageId(query?: string): Promise<string | null> {
    const params: Record<string, string> = { maxResults: '1' };
    if (query) params.q = query;

    const res = await this.request.get(GmailService.API, { headers: this.authHeader, params });
    if (!res.ok()) {
      throw new Error(`Gmail API error (list): ${res.status()} ${res.statusText()}`);
    }
    const body = await res.json();
    return body.messages?.[0]?.id ?? null;
  }

  async readLatestSnippet(query?: string): Promise<string | null> {
    this.assertToken();
    const id = await this.latestMessageId(query);
    if (!id) return null;

    const res = await this.request.get(`${GmailService.API}/${id}`, { headers: this.authHeader });
    if (!res.ok()) {
      throw new Error(`Gmail API error (get): ${res.status()} ${res.statusText()}`);
    }
    const body = await res.json();
    return body.snippet ?? null;
  }

  async currentOtp(query?: string): Promise<string> {
    const snippet = await this.readLatestSnippet(query).catch(() => null);
    return GmailService.extractOtp(snippet);
  }

  async waitForNewOtp(
    previousOtp: string,
    query?: string,
    { attempts = 15, intervalMs = 2000 }: { attempts?: number; intervalMs?: number } = {},
  ): Promise<string> {
    this.assertToken();
    for (let i = 0; i < attempts; i++) {
      const otp = await this.currentOtp(query);
      if (otp && otp !== previousOtp) return otp;
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new Error(`No new OTP arrived within ${(attempts * intervalMs) / 1000}s.`);
  }
}
