import { expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { AgentData } from '../utils/TestDataGenerator';


export class RegisterPage extends BasePage {
  private get fullName(): Locator {
    return this.page.getByRole('textbox', { name: 'Full Name' });
  }
  private get email(): Locator {
    return this.page.getByRole('textbox', { name: 'Email Address' });
  }
  private get password(): Locator {
    return this.page.getByRole('textbox', { name: 'Password' });
  }
  private get phone(): Locator {
    return this.page.getByRole('textbox', { name: 'Phone Number' });
  }
  private get nid(): Locator {
    return this.page.getByRole('textbox', { name: 'National ID (NID)' });
  }
  private get roleSelect(): Locator {
    return this.page.getByRole('combobox');
  }
  private get submit(): Locator {
    return this.page.getByRole('button', { name: /Create Account/ });
  }

  /**
   * Ensures we're on the register page and it has rendered.
   *
   * Only performs a hard navigation (`page.goto`) if we're not already
   * on `/register`. The app is client-side routed, so callers that get
   * here via HomePage.clickSignUp() are already on `/register` — a
   * second full-page navigation to that deep link was hitting the
   * server directly (bypassing the SPA router) and timing out because
   * "Create an Account" never rendered.
   */
  async open(): Promise<void> {
    if (!/\/register(?:$|[/?#])/.test(this.page.url())) {
      await this.goto('/register');
    }
    await expect(this.page.getByText('Create an Account')).toBeVisible();
  }

  async selectRole(role: string): Promise<void> {
    await this.roleSelect.click();
    await this.page.getByRole('option', { name: new RegExp(role, 'i') }).click();
  }

  async register(agent: AgentData, role = 'Agent'): Promise<void> {
    await this.fullName.fill(agent.fullName);
    await this.email.fill(agent.email);
    await this.password.fill(agent.password);
    await this.phone.fill(agent.phone);
    await this.nid.fill(agent.nid);
    await this.selectRole(role);
    await this.submit.click();
  }

  async expectRegistrationSuccess(): Promise<void> {
    await expect(this.page.getByText(/Registration successful/i)).toBeVisible();
  }
}
