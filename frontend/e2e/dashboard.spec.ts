import { expect, test } from '@playwright/test';

test('login then display dashboard metrics with mocked api', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      headers: {
        'access-control-allow-origin': '*',
      },
      json: {
        token: 'jwt-token',
        username: 'agent',
        fullName: 'Agent Commercial',
        role: 'ROLE_AGENT',
      },
    });
  });

  await page.route('**/api/dashboard', async (route) => {
    await route.fulfill({
      headers: {
        'access-control-allow-origin': '*',
      },
      json: {
        totalCustomers: 18,
        totalOffers: 6,
        draftSales: 2,
        validatedSales: 11,
        paidSales: 9,
        totalRevenue: 12490,
        recentSales: [
          {
            saleId: 1,
            saleReference: 'SALE-001',
            customerName: 'Sara Bennani',
            totalAmount: 499,
            status: 'VALIDATED',
            createdAt: '2026-05-11T10:00:00',
          },
        ],
      },
    });
  });

  await page.goto('/login');
  await page.getByLabel('Nom d’utilisateur').fill('agent');
  await page.getByLabel('Mot de passe').fill('agent123');
  const dashboardResponsePromise = page.waitForResponse(
    (response) => response.url().includes('/api/dashboard') && response.status() === 200
  );

  await Promise.all([
    page.getByRole('button', { name: 'Se connecter' }).click(),
  ]);
  const dashboardResponse = await dashboardResponsePromise;

  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard commercial' })).toBeVisible();
  expect(dashboardResponse.ok()).toBeTruthy();
});
