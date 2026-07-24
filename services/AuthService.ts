import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { GmailService } from './GmailService';
import { AgentData } from '../utils/TestDataGenerator';
import { ENV } from '../utils/env';

export class AuthService {
  private readonly login: LoginPage;

  constructor(
    private readonly page: Page,
    private readonly gmail: GmailService,
  ) {
    this.login = new LoginPage(page);
  }

  /** Clears the current session and returns to a fresh login screen. */
  async resetSession(): Promise<void> {
    await this.page.goto('/login').catch(() => undefined);
    await this.page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
      }
    });
    await this.page.context().clearCookies();
    await this.login.open();
  }

  private async loginWithPassword(identifier: string, password: string): Promise<void> {
    await this.resetSession();
    await this.login.submitCredentials(identifier, password);
    await this.page.waitForURL(/\/profile/);
  }

  async loginAsAdmin(): Promise<void> {
    await this.loginWithPassword(ENV.admin.email, ENV.admin.password);
  }

  async loginAsSystem(): Promise<void> {
    await this.loginWithPassword(ENV.system.email, ENV.system.password);
  }

  async loginAsAgent(agent: AgentData): Promise<void> {
    await this.resetSession();

    const query = 'newer_than:1h';
    const previousOtp = await this.gmail.currentOtp(query);

    await this.login.submitCredentials(agent.email, agent.password);

    const otp = await this.gmail.waitForNewOtp(previousOtp, query);
    await this.login.completeOtp(otp);
  }
}
