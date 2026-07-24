import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * The login page ("/login").
 *
 * Two flows:
 *  - Seeded accounts (admin/system): password only, redirected straight in.
 *  - Registered users (agent/customer): password, then a 4-digit email OTP step.
 *
 * Locator names below are confirmed against the live site.
 */
export class LoginPage extends BasePage {
  async open(): Promise<void> {
    await this.goto('/login');
  }

  /** Fills credentials and submits. Does not wait for what comes next. */
  async submitCredentials(identifier: string, password: string): Promise<void> {
    await this.page.getByRole('textbox', { name: 'Email or Phone Number' }).fill(identifier);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Login →' }).click();
  }

  /** Enters the OTP, verifies it, and waits for the profile page to load. */
  async completeOtp(otp: string): Promise<void> {
    await this.page.getByRole('textbox', { name: 'Enter 4-Digit OTP' }).fill(otp);
    await this.page.getByRole('button', { name: 'Verify OTP →' }).click();
    await this.page.waitForURL(/profile\/*/);
  }
}