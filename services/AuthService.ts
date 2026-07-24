import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { GmailService } from './GmailService';
import { UserData } from '../utils/TestDataGenerator';
import { ENV } from '../utils/env';

export class AuthService {
  private readonly login: LoginPage;

  constructor(
    private readonly page: Page,
    private readonly gmail: GmailService,
  ) {
    this.login = new LoginPage(page);
  }

  async resetSession(): Promise<void> {
    await this.page.context().clearCookies();
    await this.login.open();
  }

  private async loginWithPassword(identifier: string, password: string): Promise<void> {
    await this.resetSession();
    await this.login.submitCredentials(identifier, password);
    await this.page.waitForURL(/profile\/*/);
  }

  async loginAsAdmin(): Promise<void> {
    await this.loginWithPassword(ENV.admin.email, ENV.admin.password);
  }

  async loginAsSystem(): Promise<void> {
    await this.loginWithPassword(ENV.system.email, ENV.system.password);
  }

  async loginAsAgent(agent: UserData): Promise<void> {
    await this.resetSession();

    const previousOtp = await this.gmail.currentOtp();

    await this.login.submitCredentials(agent.phone, agent.password);

    const newOtp = await this.gmail.waitForNewOtp(previousOtp);
    await this.login.completeOtp(newOtp);
  }
}