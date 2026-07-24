import { test, expect } from '@playwright/test';
import { ENV } from '../utils/env';
import { TestDataGenerator } from '../utils/TestDataGenerator';
import { GmailService } from '../services/GmailService';
import { AuthService } from '../services/AuthService';
import { HomePage } from '../pages/HomePage';
import { RegisterPage } from '../pages/RegisterPage';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { AgentCashInPage } from '../pages/AgentCashInPage';
import { ProfilePage } from '../pages/ProfilePage';

test.describe('dMoney agent lifecycle', () => {
  test('signup → activate → fund → verify balance → cash-in to customer', async ({
    page,
    request,
  }) => {
    const agent = TestDataGenerator.uniqueAgent(ENV.gmail.baseLocal, ENV.agentPassword);
    const gmail = new GmailService(request, ENV.gmail.accessToken);
    const auth = new AuthService(page, gmail);

    const home = new HomePage(page);
    const register = new RegisterPage(page);
    const adminUsers = new AdminUsersPage(page);
    const cashIn = new AgentCashInPage(page);
    const profile = new ProfilePage(page);

    const { systemDeposit, customerDeposit } = ENV.amounts;

    await test.step('1. Visit the site and open Sign Up', async () => {
      await home.open();
      await home.clickSignUp();
    });

    await test.step('2-3. Register a new agent (role = Agent)', async () => {
      await register.open();
      await register.register(agent, 'Agent');
      await register.expectRegistrationSuccess();
    });

    await test.step('4. Admin activates the newly created agent', async () => {
      await auth.loginAsAdmin();
      const details = await adminUsers.openUserByPhone(agent.phone);
      await details.activate();
    });

    await test.step(`5. System deposits ${systemDeposit} Tk to the agent`, async () => {
      await auth.loginAsSystem();
      await cashIn.open();
      await cashIn.cashIn(agent.phone, systemDeposit);
      await cashIn.expectSuccess();
    });

    await test.step(`6. Agent logs in and balance is ${systemDeposit} Tk`, async () => {
      await auth.loginAsAgent(agent);
      await profile.open();
      await profile.expectBalance(systemDeposit);
    });

    await test.step(`7. Agent deposits ${customerDeposit} Tk to an existing customer`, async () => {
      await cashIn.open();
      await cashIn.cashIn(ENV.existingCustomerPhone, customerDeposit);
      await cashIn.expectSuccess();

      // Extra proof the transaction landed: agent balance should have dropped.
      await profile.open();
      const balanceAfter = await profile.getBalance();
      expect(balanceAfter).toBeLessThan(systemDeposit);
    });
  });
});
