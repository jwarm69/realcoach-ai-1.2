import Papa from 'papaparse';
import type {
  Contact,
  PipelineStage,
  MotivationLevel,
  Timeframe,
  LeadSource,
  PropertyPreferences,
} from '@/lib/database.types';

export interface ParsedData {
  [key: string]: string | undefined;
}

export interface ColumnMapping {
  [csvColumn: string]: keyof ContactInput | 'ignore';
}

export interface ContactInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  pipeline_stage?: PipelineStage;
  lead_source?: LeadSource | null;
  motivation_level?: MotivationLevel | null;
  timeframe?: Timeframe | null;
  budget_range?: string | null;
  preapproval_status?: boolean;
  property_location?: string | null;
  property_price_range?: string | null;
  property_type?: string | null;
  property_beds?: string | null;
  property_baths?: string | null;
  property_preferences?: PropertyPreferences | null;
  notes?: string | null;
}

export interface ValidationResult {
  row: number;
  valid: boolean;
  errors: string[];
  warnings: string[];
  data?: ContactInput;
}

export interface CSVParseResult {
  data: ParsedData[];
  headers: string[];
  totalRows: number;
}

export interface ImportResult {
  created: number;
  skipped: number;
  errors: string[];
}

const DB_FIELDS: (keyof ContactInput)[] = [
  'name',
  'email',
  'phone',
  'address',
  'pipeline_stage',
  'lead_source',
  'motivation_level',
  'timeframe',
  'budget_range',
  'preapproval_status',
  'property_location',
  'property_price_range',
  'property_type',
  'property_beds',
  'property_baths',
  'notes',
];

const COLUMN_PATTERNS: Record<string, RegExp[]> = {
  name: [/name/i, /full name/i, /contact/i, /customer/i, /client/i],
  first_name: [/first.?name/i, /fname/i, /given name/i],
  last_name: [/last.?name/i, /lname/i, /surname/i, /family name/i],
  email: [/email/i, /e.?mail/i, /email address/i, /mail/i],
  phone: [/phone/i, /telephone/i, /tel/i, /mobile/i, /cell/i],
  address: [/address/i, /street/i, /location/i],
  pipeline_stage: [/stage/i, /pipeline/i, /status/i, /stage\s+name/i],
  lead_source: [/source/i, /lead source/i, /origin/i, /how.*heard/i],
  motivation_level: [/motivation/i, /motiv/i, /interest/i, /level/i],
  timeframe: [/timeframe/i, /timeline/i, /when/i, /deadline/i, /target date/i],
  budget_range: [/budget/i, /price range/i, /price/i, /max price/i],
  preapproval_status: [/preapproval/i, /pre.?approval/i, /approved/i, /mortgage/i],
  property_location: [/property location/i, /location/i, /area/i, /neighborhood/i, /preferred location/i],
  property_price_range: [/property price/i, /price range/i, /budget/i],
  property_type: [/property type/i, /type/i, /property kind/i, /dwelling/i],
  property_beds: [/beds/i, /bedrooms/i, /bedroom/i, /^bed$/i],
  property_baths: [/baths/i, /bathrooms/i, /bathroom/i, /^bath$/i],
  notes: [/notes/i, /note/i, /comments/i, /comment/i, /remarks/i],
};

export async function parseCSVFile(file: File): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const data = results.data as ParsedData[];
        const headers = results.meta.fields || [];

        resolve({
          data,
          headers,
          totalRows: data.length,
        });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

export function detectColumnHeaders(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};

  for (const header of headers) {
    let matched = false;

    for (const [field, patterns] of Object.entries(COLUMN_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(header)) {
          mapping[header] = field as keyof ContactInput;
          matched = true;
          break;
        }
      }
      if (matched) break;
    }

    if (!matched) {
      mapping[header] = 'ignore';
    }
  }

  const hasFirstName = Object.values(mapping).includes('first_name' as keyof ContactInput);
  const hasLastName = Object.values(mapping).includes('last_name' as keyof ContactInput);

  if (hasFirstName || hasLastName) {
    for (const [header, field] of Object.entries(mapping)) {
      if (field === 'first_name' as keyof ContactInput || field === 'last_name' as keyof ContactInput) {
        delete mapping[header];
      }
    }
    mapping['_combined_name'] = 'name';
  }

  return mapping;
}

export function validateRowData(
  row: ParsedData,
  rowNumber: number,
  mapping: ColumnMapping
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const name = getNameFromRow(row, mapping);
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }

  const email = row[Object.keys(mapping).find(key => mapping[key] === 'email') || ''];
  if (email && email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      warnings.push(`Invalid email format: "${email}"`);
    }
  }

  const phone = row[Object.keys(mapping).find(key => mapping[key] === 'phone') || ''];
  if (phone && phone.trim()) {
    const cleanedPhone = phone.trim().replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      warnings.push(`Phone number may be invalid: "${phone}"`);
    }
  }

  return {
    row: rowNumber,
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function mapRowToContact(
  row: ParsedData,
  mapping: ColumnMapping
): ContactInput {
  const contact: ContactInput = {
    name: getNameFromRow(row, mapping),
  };

  for (const [csvColumn, targetField] of Object.entries(mapping)) {
    if (targetField === 'ignore' || csvColumn === '_combined_name') continue;

    const value = row[csvColumn]?.trim();
    if (!value) continue;

    switch (targetField) {
      case 'email':
        contact.email = value;
        break;
      case 'phone':
        contact.phone = value;
        break;
      case 'address':
        contact.address = value;
        break;
      case 'pipeline_stage':
        contact.pipeline_stage = normalizePipelineStage(value);
        break;
      case 'lead_source':
        contact.lead_source = normalizeLeadSource(value);
        break;
      case 'motivation_level':
        contact.motivation_level = normalizeMotivationLevel(value);
        break;
      case 'timeframe':
        contact.timeframe = normalizeTimeframe(value);
        break;
      case 'budget_range':
        contact.budget_range = value;
        break;
      case 'preapproval_status':
        contact.preapproval_status = normalizeBoolean(value);
        break;
      case 'property_location':
      case 'property_price_range':
      case 'property_type':
      case 'property_beds':
      case 'property_baths':
        if (!contact.property_preferences) {
          contact.property_preferences = {};
        }
        if (targetField === 'property_beds') {
          contact.property_preferences.beds = parseInt(value) || undefined;
        } else if (targetField === 'property_baths') {
          contact.property_preferences.baths = parseFloat(value) || undefined;
        } else if (targetField === 'property_location') {
          contact.property_preferences.location = value;
        } else if (targetField === 'property_price_range') {
          contact.property_preferences.priceRange = value;
        } else if (targetField === 'property_type') {
          contact.property_preferences.propertyType = value;
        }
        break;
      case 'notes':
        contact.notes = value;
        break;
    }
  }

  return contact;
}

function getNameFromRow(row: ParsedData, mapping: ColumnMapping): string {
  const firstNameKey = Object.keys(mapping).find(key => mapping[key] === 'first_name' as keyof ContactInput);
  const lastNameKey = Object.keys(mapping).find(key => mapping[key] === 'last_name' as keyof ContactInput);
  const nameKey = Object.keys(mapping).find(key => mapping[key] === 'name');

  if (firstNameKey || lastNameKey) {
    const firstName = row[firstNameKey || '']?.trim() || '';
    const lastName = row[lastNameKey || '']?.trim() || '';
    return `${firstName} ${lastName}`.trim();
  }

  return row[nameKey || '']?.trim() || '';
}

function normalizePipelineStage(value: string): PipelineStage | undefined {
  const normalized = value.toLowerCase().trim();
  const stages: PipelineStage[] = ['Lead', 'New Opportunity', 'Active Opportunity', 'Under Contract', 'Closed'];

  for (const stage of stages) {
    if (stage.toLowerCase().includes(normalized) || normalized.includes(stage.toLowerCase().replace(/\s/g, ''))) {
      return stage;
    }
  }

  if (normalized.includes('lead') || normalized === 'new') return 'Lead';
  if (normalized.includes('opportunity') || normalized.includes('opp')) return 'New Opportunity';
  if (normalized.includes('active')) return 'Active Opportunity';
  if (normalized.includes('contract') || normalized.includes('under')) return 'Under Contract';
  if (normalized.includes('closed') || normalized.includes('close')) return 'Closed';

  return undefined;
}

function normalizeLeadSource(value: string): LeadSource | undefined {
  const normalized = value.toLowerCase().trim();
  const sources: LeadSource[] = ['Referral', 'Zillow', 'Website', 'Cold Call', 'Open House', 'Social Media', 'Other'];

  for (const source of sources) {
    if (source.toLowerCase().includes(normalized) || normalized.includes(source.toLowerCase())) {
      return source;
    }
  }

  if (normalized.includes('refer')) return 'Referral';
  if (normalized.includes('zillow')) return 'Zillow';
  if (normalized.includes('web') || normalized.includes('site')) return 'Website';
  if (normalized.includes('cold') || normalized.includes('call')) return 'Cold Call';
  if (normalized.includes('open house')) return 'Open House';
  if (normalized.includes('social') || normalized.includes('facebook') || normalized.includes('instagram')) return 'Social Media';

  return 'Other';
}

function normalizeMotivationLevel(value: string): MotivationLevel | undefined {
  const normalized = value.toLowerCase().trim();

  if (normalized.includes('high') || normalized === '3' || normalized === 'hot') return 'High';
  if (normalized.includes('medium') || normalized.includes('med') || normalized === '2' || normalized === 'warm') return 'Medium';
  if (normalized.includes('low') || normalized === '1' || normalized === 'cold') return 'Low';

  return undefined;
}

function normalizeTimeframe(value: string): Timeframe | undefined {
  const normalized = value.toLowerCase().trim();

  if (normalized.includes('immediate') || normalized.includes('now') || normalized.includes('asap') || normalized.includes('urgent')) {
    return 'Immediate';
  }
  if (normalized.includes('1-3') || normalized.includes('1 to 3') || normalized.includes('one to three') || normalized.includes('quarter')) {
    return '1-3 months';
  }
  if (normalized.includes('3-6') || normalized.includes('3 to 6') || normalized.includes('three to six') || normalized.includes('6 month')) {
    return '3-6 months';
  }
  if (normalized.includes('6+') || normalized.includes('6 plus') || normalized.includes('six plus') || normalized.includes('later') || normalized.includes('future')) {
    return '6+ months';
  }

  return undefined;
}

function normalizeBoolean(value: string): boolean | undefined {
  const normalized = value.toLowerCase().trim();

  if (normalized === 'true' || normalized === 'yes' || normalized === 'y' || normalized === '1' || normalized === 'checked') {
    return true;
  }
  if (normalized === 'false' || normalized === 'no' || normalized === 'n' || normalized === '0' || normalized === 'unchecked') {
    return false;
  }

  return undefined;
}

export function getPropertyPreferencesFromRow(row: ParsedData, mapping: ColumnMapping): PropertyPreferences | null {
  const prefs: PropertyPreferences = {};
  let hasPrefs = false;

  const locationKey = Object.keys(mapping).find(key => mapping[key] === 'property_location' as keyof ContactInput);
  const priceRangeKey = Object.keys(mapping).find(key => mapping[key] === 'property_price_range' as keyof ContactInput);
  const typeKey = Object.keys(mapping).find(key => mapping[key] === 'property_type' as keyof ContactInput);
  const bedsKey = Object.keys(mapping).find(key => mapping[key] === 'property_beds' as keyof ContactInput);
  const bathsKey = Object.keys(mapping).find(key => mapping[key] === 'property_baths' as keyof ContactInput);

  if (locationKey && row[locationKey]) {
    prefs.location = row[locationKey]!.trim();
    hasPrefs = true;
  }

  if (priceRangeKey && row[priceRangeKey]) {
    prefs.priceRange = row[priceRangeKey]!.trim();
    hasPrefs = true;
  }

  if (typeKey && row[typeKey]) {
    prefs.propertyType = row[typeKey]!.trim();
    hasPrefs = true;
  }

  if (bedsKey && row[bedsKey]) {
    const beds = parseInt(row[bedsKey]!);
    if (!isNaN(beds)) {
      prefs.beds = beds;
      hasPrefs = true;
    }
  }

  if (bathsKey && row[bathsKey]) {
    const baths = parseFloat(row[bathsKey]!);
    if (!isNaN(baths)) {
      prefs.baths = baths;
      hasPrefs = true;
    }
  }

  return hasPrefs ? prefs : null;
}
