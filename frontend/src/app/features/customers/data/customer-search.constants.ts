import {
  CustomerCategoryTab,
  CustomerSearchCriteria,
  CustomerSearchField,
  CustomerSearchResult,
  CustomerSearchSummaryItem,
} from '../models/customer-search.models';

export const EMPTY_CUSTOMER_SEARCH_CRITERIA: CustomerSearchCriteria = {
  callNumber: '',
  publicKey: '',
  lastName: '',
  ccu: '',
  idNumber: '',
  clientCode: '',
  firstName: '',
  contractCode: '',
  simCard: '',
  city: '',
  ice: '',
  email: '',
};

export const EMPTY_CUSTOMER_SEARCH_RESULT: CustomerSearchResult = {
  individuals: [],
  corporates: [],
  dealers: [],
  legacy: [],
};

export const CUSTOMER_SEARCH_PAGE_SIZE = 5;

export const CUSTOMER_SEARCH_FIELDS: CustomerSearchField[] = [
  { name: 'callNumber', label: "Numéro d'appel", placeholder: "Numéro d'appel" },
  { name: 'idNumber', label: "Numéro de la pièce d'identité", placeholder: "Numéro de la pièce d'identité" },
  { name: 'simCard', label: 'Carte SIM', placeholder: 'Carte SIM' },
  { name: 'publicKey', label: 'Clé publique', placeholder: 'Clé publique' },
  { name: 'clientCode', label: 'N° client', placeholder: 'N° client' },
  { name: 'city', label: 'Ville', placeholder: 'Ville', isCityField: true },
  { name: 'lastName', label: 'Nom / Raison sociale', placeholder: 'Nom / Raison sociale' },
  { name: 'firstName', label: 'Prénom', placeholder: 'Prénom' },
  { name: 'ice', label: 'ICE', placeholder: 'ICE' },
  { name: 'ccu', label: 'CCU', placeholder: 'CCU' },
  { name: 'contractCode', label: 'Code contrat', placeholder: 'Code contrat' },
  { name: 'email', label: 'Email', placeholder: 'Email' },
];

export const CUSTOMER_SEARCH_SUMMARY_ITEMS: CustomerSearchSummaryItem[] = [
  { type: 'field', name: 'callNumber', label: "Numéro d'appel" },
  { type: 'field', name: 'idNumber', label: "Numéro de la pièce d'identité" },
  { type: 'field', name: 'simCard', label: 'Carte SIM' },
  { type: 'field', name: 'publicKey', label: 'Clé publique' },
  { type: 'field', name: 'clientCode', label: 'N° client' },
  { type: 'field', name: 'city', label: 'Ville' },
  { type: 'separator' },
  { type: 'field', name: 'lastName', label: 'Nom / Raison sociale' },
  { type: 'field', name: 'firstName', label: 'Prénom' },
  { type: 'field', name: 'email', label: 'Email' },
  { type: 'field', name: 'ice', label: 'ICE' },
  { type: 'field', name: 'ccu', label: 'CCU' },
  { type: 'field', name: 'contractCode', label: 'Code contrat' },
];

export const CUSTOMER_SEARCH_CITIES = [
  'Rabat',
  'Casablanca',
  'Salé',
  'Témara',
  'Marrakech',
  'Fès',
  'Tanger',
  'Agadir',
];

export const CUSTOMER_CATEGORY_TABS: CustomerCategoryTab[] = [
  { key: 'individual', label: 'Particulier', icon: 'user' },
  { key: 'corporate', label: 'Grand compte', icon: 'company' },
  { key: 'dealer', label: 'Revendeur / Distributeur', icon: 'dealer' },
  { key: 'legacy', label: 'Legacy', icon: 'legacy' },
];
