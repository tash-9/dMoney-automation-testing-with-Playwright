import { expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private get identifier(): Locator {
    return this.page.getByRole('textbox', { name: 'Email or Phone Number' });
  }
  private get password(): Locator {
    return this.page.getByRole('textbox', { name: 'Password' });
  }
  private get loginButton(): Locator {
    return this.page.getByRole('button', { name: /^Login/ });
  }
  private get otpInput(): Locator {
    return this.page.getByRole('textbox', { name: /Enter 4-Digit OTP/i });
  }
  private get verifyOtpButton(): Locator {
    return this.page.getByRole('button', { name: /Verify OTP/ });
  }

  async open(): Promise<void> {
    await this.goto('/login');
    await expect(this.page.getByText('Welcome Back')).toBeVisible();
  }

  /** Fills credentials and presses Login (does not wait for what comes next). */
  async submitCredentials(identifier: string, password: string): Promise<void> {
    await this.identifier.fill(identifier);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  /** Enters the OTP, verifies it and waits for the profile/dashboard. */
  async completeOtp(otp: string): Promise<void> {
    await expect(this.otpInput).toBeVisible();
    await this.otpInput.fill(otp);
    await this.verifyOtpButton.click();
    await this.page.waitForURL(/\/profile/);
  }
}
