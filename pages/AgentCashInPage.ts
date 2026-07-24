import { expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AgentCashInPage extends BasePage {
  private get phone(): Locator {
    return this.page.getByRole('textbox', { name: 'Customer Phone Number' });
  }
  private get amount(): Locator {
    return this.page.getByRole('spinbutton', { name: 'Amount (BDT)' });
  }
  private get submit(): Locator {
    return this.page.getByRole('button', { name: /Cash In/ });
  }

  async open(): Promise<void> {
    await this.goto('/agent/cash-in');
    await expect(this.phone).toBeVisible();
  }

  async cashIn(phone: string, amount: number): Promise<void> {
    await this.phone.fill(phone);
    await this.amount.fill(String(amount));
    await this.submit.click();
  }

  /**
   * Asserts the on-screen success feedback for the last cash-in.
   *
   * The app shows a transient success notification. We match it loosely so a
   * wording change ("successful" / "success" / "cash in") does not break the
   * test; the caller additionally proves the transaction via the balance delta.
   */
  async expectSuccess(): Promise<void> {
    await expect(
      this.page.getByText(/success|successful|cash.?in successful/i).first(),
    ).toBeVisible({ timeout: 20_000 });
  }
}
