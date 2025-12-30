import type { ContactInput } from './csv-parser';

export interface GoogleContact {
  resourceName: string;
  etag: string;
  names?: Array<{
    displayName?: string;
    givenName?: string;
    familyName?: string;
  }>;
  emailAddresses?: Array<{
    value?: string;
    type?: string;
  }>;
  phoneNumbers?: Array<{
    value?: string;
    type?: string;
  }>;
  addresses?: Array<{
    streetAddress?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  }>;
  organizations?: Array<{
    name?: string;
    title?: string;
  }>;
  birthdays?: Array<{
    date?: {
      year?: number;
      month?: number;
      day?: number;
    };
  }>;
  notes?: string;
}

export interface GoogleContactsResponse {
  connections?: GoogleContact[];
  nextPageToken?: string;
  totalPeople?: number;
}

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

const GOOGLE_PEOPLE_API_BASE = 'https://people.googleapis.com/v1';

export function getGoogleAuthUrl(redirectUri: string): string {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error('Google Client ID is not configured');
  }

  const scope = encodeURIComponent([
    'https://www.googleapis.com/auth/contacts.readonly',
  ].join(' '));

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  return authUrl.toString();
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<GoogleTokens> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials are not configured');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  return response.json();
}

export async function fetchGoogleContacts(
  accessToken: string,
  pageToken?: string
): Promise<GoogleContactsResponse> {
  const url = new URL(`${GOOGLE_PEOPLE_API_BASE}/me/connections`);
  url.searchParams.set('personFields', 'names,emailAddresses,phoneNumbers,addresses,organizations,birthdays,notes');
  url.searchParams.set('pageSize', '1000');
  if (pageToken) {
    url.searchParams.set('pageToken', pageToken);
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Google Contacts: ${error}`);
  }

  return response.json();
}

export async function fetchAllGoogleContacts(
  accessToken: string
): Promise<GoogleContact[]> {
  let allContacts: GoogleContact[] = [];
  let pageToken: string | undefined;

  do {
    const response = await fetchGoogleContacts(accessToken, pageToken);
    allContacts = [...allContacts, ...(response.connections || [])];
    pageToken = response.nextPageToken;
  } while (pageToken);

  return allContacts;
}

export function mapGoogleContactToInput(
  googleContact: GoogleContact
): ContactInput | null {
  const name = googleContact.names?.[0]?.displayName?.trim();
  if (!name) {
    return null;
  }

  const email = googleContact.emailAddresses?.[0]?.value?.trim();
  const phone = googleContact.phoneNumbers?.[0]?.value?.trim();

  const addressParts = googleContact.addresses?.[0];
  const address = addressParts
    ? [addressParts.streetAddress, addressParts.city, addressParts.region, addressParts.postalCode, addressParts.country]
        .filter(Boolean)
        .join(', ')
    : undefined;

  const notes = googleContact.notes?.trim();

  return {
    name,
    email: email || null,
    phone: phone || null,
    address: address || null,
    notes: notes || null,
  };
}

export async function importGoogleContacts(
  accessToken: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ contacts: ContactInput[]; total: number }> {
  const googleContacts = await fetchAllGoogleContacts(accessToken);

  const contacts = googleContacts
    .map(mapGoogleContactToInput)
    .filter((c): c is ContactInput => c !== null);

  if (onProgress) {
    onProgress(contacts.length, contacts.length);
  }

  return { contacts, total: googleContacts.length };
}
