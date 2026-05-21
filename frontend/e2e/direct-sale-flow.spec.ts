import { expect, type Route, test } from '@playwright/test';

test('recherche client, nouveau panier, produit, paiement et facture', async ({ page }) => {
  const customer = {
    id: 9001,
    firstName: 'Ali',
    lastName: 'Credit',
    fullName: 'Ali Credit',
    cin: 'AZ7489',
    phone: '0600000000',
    email: 'alicredit@example.com',
    address: 'AZAHRAE',
    city: 'SALE LAYAYDA',
  };
  const offer = {
    id: 3001,
    code: 'RECHARGE-100',
    name: 'RECHARGE MOBILE 100DH',
    category: 'RECHARGE',
    description: 'RECHARGE MOBILE 100DH',
    price: 83.33,
    duration: 30,
    active: true,
  };
  let saleState = buildSale('DRAFT', [], 0);

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (method === 'OPTIONS') {
      await fulfillJson(route, {});
      return;
    }

    if (method === 'POST' && path.endsWith('/auth/login')) {
      await fulfillJson(route, { token: 'e2e-token', username: 'agent', fullName: 'Agent E2E', role: 'AGENT' });
      return;
    }
    if (method === 'GET' && path.endsWith('/customers')) {
      await fulfillJson(route, [customer]);
      return;
    }
    if (method === 'GET' && path.endsWith('/customers/search')) {
      await fulfillJson(route, [customer]);
      return;
    }
    if (method === 'GET' && path.endsWith('/offers/active')) {
      await fulfillJson(route, [offer]);
      return;
    }
    if (method === 'POST' && path.endsWith('/sales')) {
      saleState = buildSale('DRAFT', [], 0);
      await fulfillJson(route, saleState);
      return;
    }
    if (method === 'GET' && path.endsWith('/sales/7001')) {
      await fulfillJson(route, saleState);
      return;
    }
    if (method === 'POST' && path.endsWith('/sales/7001/items')) {
      saleState = buildSale('DRAFT', [{
        id: 1,
        offerId: offer.id,
        offerCode: offer.code,
        offerName: offer.name,
        unitPrice: offer.price,
        quantity: 1,
        totalPrice: offer.price,
      }], offer.price);
      await fulfillJson(route, saleState);
      return;
    }
    if (method === 'POST' && path.endsWith('/sales/7001/validate')) {
      saleState = { ...saleState, status: 'VALIDATED', validatedAt: '2026-05-16T10:10:00' };
      await fulfillJson(route, saleState);
      return;
    }
    if (method === 'POST' && path.endsWith('/sales/7001/payment')) {
      saleState = { ...saleState, status: 'PAID', paid: true };
      await fulfillJson(route, {
        id: 1,
        saleId: 7001,
        amount: offer.price,
        method: 'CASH',
        status: 'PAID',
        paidAt: '2026-05-16T10:15:00',
        reference: 'PAY-E2E-001',
        invoiceNumber: 'INV-E2E-001',
      });
      return;
    }
    if (method === 'POST' && path.endsWith('/invoices/sale/7001')) {
      await fulfillJson(route, {
        invoiceNumber: 'INV-E2E-001',
        saleId: 7001,
        saleNumber: 'SALE-E2E-001',
        generatedAt: '2026-05-16T10:16:00',
        customerName: customer.fullName,
        customerCin: customer.cin,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        customerAddress: customer.address,
        customerCity: customer.city,
        agentName: 'Agent E2E',
        agentUsername: 'agent',
        totalAmount: offer.price,
        method: 'CASH',
        paymentReference: 'PAY-E2E-001',
        items: saleState.items,
      });
      return;
    }
    if (method === 'GET' && path.endsWith('/sales')) {
      await fulfillJson(route, [saleState]);
      return;
    }

    await fulfillJson(route, { message: `Unhandled ${method} ${path}` }, 404);
  });

  await page.goto('/login');
  await page.locator('input[formControlName="username"]').fill('agent');
  await page.locator('input[formControlName="password"]').fill('agent123');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  await expect(page).toHaveURL(/\/sales\/new$/);
  await page.locator('input[formControlName="identityNumber"]').fill(customer.cin);
  await page.getByRole('button', { name: 'Rechercher' }).click();
  await page.getByRole('button', { name: new RegExp(customer.fullName) }).click();
  await page.getByRole('button', { name: 'Nouveau panier' }).click();
  await page.locator('select[formControlName="creditDuration"]').selectOption('12 Mois');
  await page.getByRole('button', { name: 'Continuer' }).click();

  await expect(page).toHaveURL(/\/sales\/7001$/);
  await page.getByText(offer.name).first().click();
  await page.getByRole('button', { name: 'Ajouter au devis' }).click();
  await page.getByRole('button', { name: 'Voir le devis' }).click();
  await expect(page.getByText('Resume du devis')).toBeVisible();
  await page.getByRole('button', { name: 'Passer la commande' }).click();

  await expect(page).toHaveURL(/\/sales\/7001\/payment$/);
  await page.getByRole('button', { name: 'Ajouter le paiement' }).click();
  await expect(page.getByText('Montant total paye')).toBeVisible();
  await page.getByRole('button', { name: 'Payer la facture' }).click();
  await expect(page.getByText('Succes de la soumission')).toBeVisible();
});

function buildSale(status: 'DRAFT' | 'VALIDATED' | 'PAID', items: unknown[], totalAmount: number) {
  return {
    id: 7001,
    saleNumber: 'SALE-E2E-001',
    customerId: 9001,
    customerName: 'Ali Credit',
    customerPhone: '0600000000',
    status,
    cancellationReason: null,
    totalAmount,
    paid: status === 'PAID',
    createdAt: '2026-05-16T10:00:00',
    validatedAt: status === 'DRAFT' ? null : '2026-05-16T10:10:00',
    agent: 'Agent E2E',
    items,
  };
}

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    },
    json: body,
  });
}
