import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Customer, CustomerContract } from '../../../core/models/customer.models';
import { CustomerService } from '../../../core/services/customer.service';
import {
  CustomerCategory,
  CustomerSearchCriteria,
  CustomerSearchRecord,
  CustomerSearchRecordContract,
  CustomerSearchResult,
} from '../models/customer-search.models';

const KEYWORD_ENDPOINT_FIELDS: Array<keyof CustomerSearchCriteria> = [
  'callNumber',
  'idNumber',
  'lastName',
  'firstName',
  'email',
];

@Injectable({ providedIn: 'root' })
export class CustomerSearchService {
  constructor(private readonly customerService: CustomerService) {}

  search(criteria: CustomerSearchCriteria): Observable<CustomerSearchResult> {
    const trimmedCriteria = this.trimCriteria(criteria);
    const filledEntries = this.getFilledEntries(trimmedCriteria);
    const source$ = this.shouldUseKeywordEndpoint(filledEntries)
      ? this.customerService.searchCustomers(filledEntries[0][1])
      : this.customerService.getCustomers();

    return source$.pipe(
      map((customers) => this.filterCustomers(customers, trimmedCriteria)),
      map((customers) => this.groupCustomers(customers))
    );
  }

  private shouldUseKeywordEndpoint(entries: Array<[keyof CustomerSearchCriteria, string]>): boolean {
    return entries.length === 1 && KEYWORD_ENDPOINT_FIELDS.includes(entries[0][0]);
  }

  private trimCriteria(criteria: CustomerSearchCriteria): CustomerSearchCriteria {
    return {
      callNumber: criteria.callNumber.trim(),
      publicKey: criteria.publicKey.trim(),
      lastName: criteria.lastName.trim(),
      ccu: criteria.ccu.trim(),
      idNumber: criteria.idNumber.trim(),
      clientCode: criteria.clientCode.trim(),
      firstName: criteria.firstName.trim(),
      contractCode: criteria.contractCode.trim(),
      simCard: criteria.simCard.trim(),
      city: criteria.city.trim(),
      ice: criteria.ice.trim(),
      email: criteria.email.trim(),
    };
  }

  private getFilledEntries(criteria: CustomerSearchCriteria): Array<[keyof CustomerSearchCriteria, string]> {
    return Object.entries(criteria).filter((entry): entry is [keyof CustomerSearchCriteria, string] => Boolean(entry[1]));
  }

  private filterCustomers(customers: Customer[], criteria: CustomerSearchCriteria): Customer[] {
    const filledEntries = this.getFilledEntries(criteria);

    if (!filledEntries.length) {
      return customers;
    }

    return customers.filter((customer) =>
      filledEntries.every(([criterionName, expectedValue]) =>
        this.matchesCriterion(customer, criterionName, expectedValue)
      )
    );
  }

  private matchesCriterion(
    customer: Customer,
    criterionName: keyof CustomerSearchCriteria,
    expectedValue: string
  ): boolean {
    return this.getCriterionValues(customer, criterionName).some((value) =>
      this.normalize(value).includes(this.normalize(expectedValue))
    );
  }

  private getCriterionValues(
    customer: Customer,
    criterionName: keyof CustomerSearchCriteria
  ): Array<string | null | undefined> {
    const profile = customer.profile;
    const contracts = profile?.contracts ?? [];

    switch (criterionName) {
      case 'callNumber':
        return [customer.phone, ...contracts.map((contract) => contract.phone)];
      case 'publicKey':
        return [profile?.publicKey];
      case 'lastName':
        return [customer.fullName, customer.lastName];
      case 'ccu':
        return [profile?.ccu];
      case 'idNumber':
        return [customer.cin, profile?.identityType];
      case 'clientCode':
        return [profile?.customerNumber];
      case 'firstName':
        return [customer.firstName, customer.fullName];
      case 'contractCode':
        return contracts.map((contract) => contract.reference);
      case 'simCard':
        return contracts.map((contract) => contract.imsi);
      case 'city':
        return [customer.city];
      case 'ice':
        return [profile?.ice];
      case 'email':
        return [customer.email, profile?.commercial.email];
      default:
        return [];
    }
  }

  private groupCustomers(customers: Customer[]): CustomerSearchResult {
    const result: CustomerSearchResult = {
      individuals: [],
      corporates: [],
      dealers: [],
      legacy: [],
    };

    customers
      .map((customer) => this.toRecord(customer))
      .sort((firstRecord, secondRecord) => firstRecord.displayName.localeCompare(secondRecord.displayName))
      .forEach((record) => {
        if (record.category === 'corporate') {
          result.corporates.push(record);
          return;
        }

        if (record.category === 'dealer') {
          result.dealers.push(record);
          return;
        }

        if (record.category === 'legacy') {
          result.legacy.push(record);
          return;
        }

        result.individuals.push(record);
      });

    return result;
  }

  private toRecord(customer: Customer): CustomerSearchRecord {
    const profile = customer.profile;
    const addressLines = [
      customer.address,
      profile?.addressComplement && profile.addressComplement !== '-' ? profile.addressComplement : null,
      [customer.city, profile?.postalCode].filter(Boolean).join(' ').trim(),
    ].filter((value): value is string => Boolean(value && value.trim()));

    return {
      id: customer.id,
      category: this.getCategory(customer),
      displayName: customer.fullName,
      customerNumber: profile?.customerNumber ?? customer.phone,
      identityType: profile?.identityType ?? 'CIN',
      identityNumber: customer.cin,
      segment: profile?.segment ?? '-',
      customerClass: profile?.customerClass ?? profile?.category ?? '-',
      addressLines: addressLines.length ? addressLines : ['-'],
      contracts: this.mapContracts(profile?.contracts ?? []),
    };
  }

  private getCategory(customer: Customer): CustomerCategory {
    const category = customer.profile?.searchCategory ?? 'individual';
    return category;
  }

  private mapContracts(contracts: CustomerContract[]): CustomerSearchRecordContract[] {
    return contracts.map((contract) => ({
      contractNumber: contract.reference,
      activationDate: contract.activatedAt,
      imsi: contract.imsi,
      nd: contract.phone,
      offer: contract.offer,
    }));
  }

  private normalize(value: string | null | undefined): string {
    return (value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
