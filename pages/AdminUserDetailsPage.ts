import { expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminUserDetailsPage extends BasePage {
  private get editButton(): Locator {
    return this.page.getByRole('button', { name: 'Edit User' });
  }
  private get saveButton(): Locator {
    return this.page.getByRole('button', { name: 'Save Changes' });
  }
  
  private get statusSelect(): Locator {
    return this.page.getByRole('combobox').filter({ hasText: 'Pending' });
  }
  private get statusBadge(): Locator {
    return this.page.getByText('ACTIVE', { exact: true }).first();
  }

  async activate(): Promise<void> {
    await this.editButton.click();
    await this.statusSelect.click();
    await this.page.getByRole('option', { name: 'Active', exact: true }).click();
    await this.saveButton.click();
    await expect(this.statusBadge).toBeVisible();
  }
}

