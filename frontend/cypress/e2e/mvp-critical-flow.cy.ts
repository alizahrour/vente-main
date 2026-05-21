describe('Parcours vente directe - recherche client vers paiement', () => {
  const testRun = Date.now();
  const customer = {
    id: 9001,
    firstName: 'Ali',
    lastName: `Credit ${testRun}`,
    fullName: `Ali Credit ${testRun}`,
    cin: `AZ${String(testRun).slice(-5)}`,
    phone: `060${String(testRun).slice(-7)}`,
    email: `alicredit.${testRun}@example.com`,
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

  beforeEach(() => {
    saleState = buildSale('DRAFT', [], 0);
    cy.clearLocalStorage();
    registerApiMocks();
  });

  it('cree un panier client, ajoute un produit, valide le devis et paie la facture', () => {
    cy.visit('/login');
    cy.get('input[formControlName="username"]').clear().type('agent');
    cy.get('input[formControlName="password"]').clear().type('agent123');
    cy.contains('button', 'Se connecter').click();

    cy.location('pathname').should('eq', '/sales/new');
    cy.contains('Recherche clients').should('be.visible');

    cy.get('input[formControlName="identityNumber"]').type(customer.cin);
    cy.contains('button', 'Rechercher').click();
    cy.wait('@searchCustomer');
    cy.contains(customer.fullName).click();

    cy.contains('Vue d').should('be.visible');
    cy.contains('Nouveau panier').click();
    cy.contains('Entrez les details du devis').should('be.visible');
    cy.get('select[formControlName="creditDuration"]').select('12 Mois');
    cy.contains('button', 'Continuer').click();
    cy.wait('@createSale');

    cy.location('pathname').should('eq', '/sales/7001');
    cy.wait('@getActiveOffers');
    cy.contains('Parcourir les produits').should('be.visible');
    cy.contains(offer.name).click();
    cy.contains('Ajouter au devis').click();
    cy.wait('@addSaleItem');
    cy.contains('Produit ajoute au devis').should('be.visible');

    cy.contains('button', 'Voir le devis').click();
    cy.contains('Resume du devis').should('be.visible');
    cy.contains(offer.name).should('be.visible');
    cy.contains('Dhs83.33').should('be.visible');
    cy.contains('button', 'Passer la commande').click();
    cy.wait('@validateSale');

    cy.location('pathname').should('eq', '/sales/7001/payment');
    cy.contains('Paiement').should('be.visible');
    cy.get('input[formControlName="amount"]').should('have.value', '83.33');
    cy.contains('button', 'Ajouter le paiement').click();
    cy.wait('@paySale');
    cy.contains('Montant total paye').should('be.visible');
    cy.contains('button', 'Payer la facture').should('not.be.disabled').click();
    cy.wait('@generateInvoice');

    cy.contains('Succes de la soumission').should('be.visible');
    cy.contains('SALE-E2E-001').should('be.visible');
    cy.contains("D'accord").click();

    cy.location('pathname').should('eq', '/sales/history');
    cy.wait('@getSalesHistory');
    cy.contains('SALE-E2E-001').should('be.visible');
    cy.contains('PAID').should('be.visible');
  });

  function registerApiMocks(): void {
    cy.intercept('POST', '**/api/auth/login', {
      token: 'e2e-token',
      username: 'agent',
      fullName: 'Agent E2E',
      role: 'AGENT',
    }).as('login');

    cy.intercept('GET', '**/api/customers', [customer]).as('getCustomers');
    cy.intercept('GET', '**/api/customers/search*', (req) => {
      expect(req.query['keyword']).to.eq(customer.cin);
      req.reply([customer]);
    }).as('searchCustomer');

    cy.intercept('GET', '**/api/offers/active', [offer]).as('getActiveOffers');

    cy.intercept('POST', '**/api/sales', (req) => {
      expect(req.body).to.deep.eq({ customerId: customer.id, items: [] });
      saleState = buildSale('DRAFT', [], 0);
      req.reply(saleState);
    }).as('createSale');

    cy.intercept('GET', '**/api/sales/7001', (req) => {
      req.reply(saleState);
    }).as('getSale');

    cy.intercept('POST', '**/api/sales/7001/items', (req) => {
      expect(req.body).to.deep.eq({ offerId: offer.id, quantity: 1 });
      saleState = buildSale('DRAFT', [{
        id: 1,
        offerId: offer.id,
        offerCode: offer.code,
        offerName: offer.name,
        unitPrice: offer.price,
        quantity: 1,
        totalPrice: offer.price,
      }], offer.price);
      req.reply(saleState);
    }).as('addSaleItem');

    cy.intercept('POST', '**/api/sales/7001/validate', (req) => {
      saleState = { ...saleState, status: 'VALIDATED', validatedAt: '2026-05-16T10:10:00' };
      req.reply(saleState);
    }).as('validateSale');

    cy.intercept('POST', '**/api/sales/7001/payment', (req) => {
      expect(req.body).to.deep.eq({ amount: offer.price, method: 'CASH' });
      saleState = { ...saleState, status: 'PAID', paid: true };
      req.reply({
        id: 1,
        saleId: 7001,
        amount: offer.price,
        method: 'CASH',
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
        totalAmount: offer.price,
        method: 'CASH',
        paymentReference: 'PAY-E2E-001',
        items: saleState.items,
      });
    }).as('generateInvoice');

    cy.intercept('GET', '**/api/sales', (req) => {
      req.reply([saleState]);
    }).as('getSalesHistory');
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
