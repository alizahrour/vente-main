describe('MVP vente directe telecom - parcours critique', () => {
  const testRun = Date.now();
  const customer = {
    id: 9001,
    firstName: 'E2E',
    lastName: `Client ${testRun}`,
    fullName: `E2E Client ${testRun}`,
    cin: `E2E${testRun}`,
    phone: `060${String(testRun).slice(-7)}`,
    email: `e2e.${testRun}@example.com`,
    address: 'Adresse test E2E',
    city: 'Casablanca',
  };

  const offer = {
    id: 3001,
    code: 'FIBRE-E2E',
    name: 'Fibre Pro E2E',
    category: 'FIBRE',
    description: 'Offre fibre de test',
    price: 299,
    duration: 30,
    active: true,
  };

  let customerCreated = false;
  let saleState = buildSale('DRAFT', [], 0);

  beforeEach(() => {
    customerCreated = false;
    saleState = buildSale('DRAFT', [], 0);
    cy.clearLocalStorage();
    registerApiMocks();
  });

  it('valide le parcours agent complet de la creation client au dashboard', () => {
    cy.visit('/login');
    cy.get('input[formControlName="username"]').clear().type('agent');
    cy.get('input[formControlName="password"]').clear().type('agent123');
    cy.contains('button', 'Se connecter').click();

    cy.location('pathname').should('eq', '/sales/new');
    cy.contains('Agent E2E').should('be.visible');

    cy.contains('a', 'Clients').click();
    cy.location('pathname').should('eq', '/customers');
    cy.contains('a', 'Nouveau client').click();
    cy.location('pathname').should('eq', '/customers/new');

    cy.get('input[formControlName="firstName"]').type(customer.firstName);
    cy.get('input[formControlName="lastName"]').type(customer.lastName);
    cy.get('input[formControlName="cin"]').type(customer.cin);
    cy.get('input[formControlName="phone"]').type(customer.phone);
    cy.get('input[formControlName="email"]').type(customer.email);
    cy.get('input[formControlName="city"]').type(customer.city);
    cy.get('textarea[formControlName="address"]').type(customer.address);
    cy.contains('button', 'Enregistrer').click();

    cy.location('pathname').should('eq', '/customers');
    cy.wait('@createCustomer');
    cy.contains(customer.fullName).should('be.visible');

    cy.get('input[placeholder*="Nom"]').clear().type(customer.cin);
    cy.contains('button', 'Rechercher').click();
    cy.wait('@searchCustomer');
    cy.contains(customer.fullName).should('be.visible');
    cy.contains(customer.phone).should('be.visible');

    cy.contains('a', 'Catalogue offres').click();
    cy.location('pathname').should('eq', '/offers');
    cy.wait('@getOffers');
    cy.contains(offer.name).should('be.visible');
    cy.contains('Active').should('be.visible');

    cy.contains('a', 'Creer une vente').click();
    cy.location('pathname').should('eq', '/sales/new');
    cy.get('select[formControlName="customerId"]').select(`${customer.fullName} - ${customer.phone}`);
    cy.contains('button', 'Creer la vente').click();
    cy.wait('@createSale');
    cy.location('pathname').should('eq', '/sales/7001');

    cy.get('select[formControlName="offerId"]').select(`${offer.name} - ${offer.price} MAD`);
    cy.get('input[formControlName="quantity"]').clear().type('2');
    cy.contains('button', 'Ajouter').click();
    cy.wait('@addSaleItem');
    cy.contains(offer.name).should('be.visible');
    cy.contains('598.00').should('be.visible');
    cy.contains('Total: 598.00 MAD').should('be.visible');

    cy.contains('button', 'Valider').click();
    cy.wait('@validateSale');
    cy.contains('VALIDATED').should('be.visible');

    cy.contains('button', 'Paiement').click();
    cy.location('pathname').should('eq', '/sales/7001/payment');
    cy.get('input[formControlName="amount"]').should('have.value', '598').and('have.attr', 'readonly');
    cy.get('select[formControlName="method"]').select('CARD');
    cy.contains('button', 'Enregistrer le paiement').click();
    cy.wait('@paySale');

    cy.location('pathname').should('eq', '/sales/7001/invoice');
    cy.wait('@generateInvoice');
    cy.contains('INV-E2E-001').should('be.visible');
    cy.contains('SALE-E2E-001').should('be.visible');
    cy.contains(customer.fullName).should('be.visible');
    cy.contains('Agent E2E').should('be.visible');
    cy.contains('PAY-E2E-001').should('be.visible');
    cy.contains('598.00 MAD').should('be.visible');
    cy.contains('button', 'Imprimer').should('be.visible');

    cy.contains('a', 'Retour historique ventes').click();
    cy.location('pathname').should('eq', '/sales/history');
    cy.wait('@getSalesHistory');
    cy.contains('SALE-E2E-001').should('be.visible');
    cy.contains(customer.fullName).should('be.visible');
    cy.contains('PAID').should('be.visible');

    cy.contains('a', 'Tableau de bord').click();
    cy.location('pathname').should('eq', '/dashboard');
    cy.wait('@getDashboard');
    cy.contains('Dashboard commercial').should('be.visible');
    cy.contains('Ventes payees').should('be.visible');
    cy.contains('598').should('be.visible');
    cy.contains(offer.name).should('be.visible');
  });

  function registerApiMocks(): void {
    cy.intercept('POST', '**/api/auth/login', {
      token: 'e2e-token',
      username: 'agent',
      fullName: 'Agent E2E',
      role: 'AGENT',
    }).as('login');

    cy.intercept('GET', '**/api/customers', (req) => {
      req.reply(customerCreated ? [customer] : []);
    }).as('getCustomers');

    cy.intercept('POST', '**/api/customers', (req) => {
      expect(req.body).to.include({
        firstName: customer.firstName,
        lastName: customer.lastName,
        cin: customer.cin,
        phone: customer.phone,
      });
      customerCreated = true;
      req.reply(customer);
    }).as('createCustomer');

    cy.intercept('GET', '**/api/customers/search*', (req) => {
      expect(req.query['keyword']).to.eq(customer.cin);
      req.reply([customer]);
    }).as('searchCustomer');

    cy.intercept('GET', '**/api/offers/active', [offer]).as('getActiveOffers');
    cy.intercept('GET', '**/api/offers?*', [offer]).as('getOffers');
    cy.intercept('GET', '**/api/offers', [offer]).as('getOffersNoQuery');

    cy.intercept('POST', '**/api/sales', (req) => {
      expect(req.body).to.deep.eq({ customerId: customer.id, items: [] });
      saleState = buildSale('DRAFT', [], 0);
      req.reply(saleState);
    }).as('createSale');

    cy.intercept('GET', '**/api/sales/7001', (req) => {
      req.reply(saleState);
    }).as('getSale');

    cy.intercept('POST', '**/api/sales/7001/items', (req) => {
      expect(req.body).to.deep.eq({ offerId: offer.id, quantity: 2 });
      const item = {
        id: 1,
        offerId: offer.id,
        offerCode: offer.code,
        offerName: offer.name,
        unitPrice: offer.price,
        quantity: 2,
        totalPrice: 598,
      };
      saleState = buildSale('DRAFT', [item], 598);
      req.reply(saleState);
    }).as('addSaleItem');

    cy.intercept('POST', '**/api/sales/7001/validate', (req) => {
      saleState = { ...saleState, status: 'VALIDATED', validatedAt: '2026-05-16T10:10:00' };
      req.reply(saleState);
    }).as('validateSale');

    cy.intercept('POST', '**/api/sales/7001/payment', (req) => {
      expect(req.body).to.deep.eq({ amount: 598, method: 'CARD' });
      saleState = { ...saleState, status: 'PAID', paid: true };
      req.reply({
        id: 1,
        saleId: 7001,
        amount: 598,
        method: 'CARD',
        status: 'PAID',
        paidAt: '2026-05-16T10:15:00',
        reference: 'PAY-E2E-001',
        invoiceNumber: 'INV-E2E-001',
      });
    }).as('paySale');

    cy.intercept('POST', '**/api/invoices/sale/7001', (req) => {
      req.reply({
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
        totalAmount: 598,
        method: 'CARD',
        paymentReference: 'PAY-E2E-001',
        items: saleState.items,
      });
    }).as('generateInvoice');

    cy.intercept('GET', '**/api/sales', (req) => {
      req.reply([saleState]);
    }).as('getSalesHistory');

    cy.intercept('GET', '**/api/dashboard/summary', {
      totalCustomers: 1,
      totalOffers: 1,
      totalSales: 1,
      draftSales: 0,
      validatedSales: 0,
      paidSales: 1,
      cancelledSales: 0,
      totalRevenue: 598,
      recentSales: [{
        saleId: 7001,
        saleNumber: 'SALE-E2E-001',
        customerName: customer.fullName,
        agentName: 'Agent E2E',
        totalAmount: 598,
        status: 'PAID',
        createdAt: '2026-05-16T10:00:00',
      }],
    }).as('getDashboard');
    cy.intercept('GET', '**/api/dashboard/sales-by-offer', [{ label: offer.name, value: 2 }]).as('salesByOffer');
    cy.intercept('GET', '**/api/dashboard/sales-by-agent', [{ label: 'Agent E2E', value: 1 }]).as('salesByAgent');
    cy.intercept('GET', '**/api/dashboard/revenue-by-month', [{ label: '2026-05', value: 598 }]).as('revenueByMonth');
  }

  function buildSale(status: 'DRAFT' | 'VALIDATED' | 'PAID', items: unknown[], totalAmount: number) {
    return {
      id: 7001,
      saleNumber: 'SALE-E2E-001',
      customerId: customer.id,
      customerName: customer.fullName,
      customerPhone: customer.phone,
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
});
