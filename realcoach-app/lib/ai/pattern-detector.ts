/**
 * Rule-Based Pattern Detector
 *
 * Tier 1: Zero-cost, high-speed pattern detection using regex patterns.
 * Detects common real estate conversation patterns with high confidence.
 */

export interface PatternDetectionResult {
  buyingIntent: boolean;
  sellingIntent: boolean;
  urgency: boolean;
  specificProperty: boolean;
  preapproval: boolean;
  showings: boolean;
  offerAccepted: boolean;
  closing: boolean;
  confidence: number;
  matchedPatterns: string[];
}

/**
 * Detect patterns in conversation text using rule-based matching
 */
export function detectPatterns(text: string): PatternDetectionResult {
  const result: PatternDetectionResult = {
    buyingIntent: false,
    sellingIntent: false,
    urgency: false,
    specificProperty: false,
    preapproval: false,
    showings: false,
    offerAccepted: false,
    closing: false,
    confidence: 0,
    matchedPatterns: []
  };

  const lowerText = text.toLowerCase();

  // Buying intent patterns
  const buyingPatterns = [
    /looking to buy|want to purchase|interested in buying|buyer's agent|representing me to buy/i
  ];
  if (buyingPatterns.some(pattern => pattern.test(text))) {
    result.buyingIntent = true;
    result.matchedPatterns.push('buying-intent');
  }

  // Selling intent patterns
  const sellingPatterns = [
    /looking to sell|want to sell|thinking of selling|just listed|going to list|listing my home/i
  ];
  if (sellingPatterns.some(pattern => pattern.test(text))) {
    result.sellingIntent = true;
    result.matchedPatterns.push('selling-intent');
  }

  // Urgency patterns
  const urgencyPatterns = [
    /\b(asap|immediately|right now|urgent|as soon as possible|need to|quickly|soon)\b/i
  ];
  if (urgencyPatterns.some(pattern => pattern.test(text))) {
    result.urgency = true;
    result.matchedPatterns.push('urgency');
  }

  // Specific property patterns
  const specificPropertyPatterns = [
    /\b(in \w+ area|in \w+ neighborhood|near|downtown|suburb)\b/i,
    /\b(\d+)\s*bedroom?\b/i,
    /\b(\d+)\s*bath?\b/i,
    /\b(pool|garage|yard|garden|acre|lot)\b/i,
    /\b(under \$\d{3,}|up to \$\d{3,}|budget \$\d{3,})\b/i,
    /\b(sqft|square foot|square feet)\b/i
  ];
  if (specificPropertyPatterns.some(pattern => pattern.test(text))) {
    result.specificProperty = true;
    result.matchedPatterns.push('specific-property');
  }

  // Pre-approval patterns
  const preapprovalPatterns = [
    /\b(pre-approval|pre-qualified|pre-approved|mortgage approval|lender|loan officer)\b/i
  ];
  if (preapprovalPatterns.some(pattern => pattern.test(text))) {
    result.preapproval = true;
    result.matchedPatterns.push('preapproval');
  }

  // Showings patterns
  const showingPatterns = [
    /\b(saw \d+ home|showing|viewed|visited|tour|looking at homes|went to see|saw a house|saw a property)\b/i
  ];
  if (showingPatterns.some(pattern => pattern.test(text))) {
    result.showings = true;
    result.matchedPatterns.push('showings');
  }

  // Offer accepted patterns
  const offerAcceptedPatterns = [
    /\b(offer accepted|under contract|seller accepted|they accepted|they took our offer)\b/i
  ];
  if (offerAcceptedPatterns.some(pattern => pattern.test(text))) {
    result.offerAccepted = true;
    result.matchedPatterns.push('offer-accepted');
  }

  // Closing patterns
  const closingPatterns = [
    /\b(closed|closing complete|got the keys|funding|documents signed|closing table|closed on)\b/i
  ];
  if (closingPatterns.some(pattern => pattern.test(text))) {
    result.closing = true;
    result.matchedPatterns.push('closing');
  }

  // Calculate confidence based on number of matched patterns
  result.confidence = calculateConfidence(result.matchedPatterns.length);

  return result;
}

/**
 * Calculate confidence score based on pattern matches
 */
function calculateConfidence(matchCount: number): number {
  if (matchCount === 0) return 0;
  if (matchCount === 1) return 70;
  if (matchCount === 2) return 80;
  if (matchCount === 3) return 90;
  return 95;
}

/**
 * Extract phone numbers from text
 */
export function extractPhoneNumbers(text: string): string[] {
  const phonePatterns = [
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    /\b\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    /\b\d{10}\b/g
  ];

  const phones = new Set<string>();

  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(phone => {
        const cleaned = phone.replace(/[^\d+]/g, '');
        if (cleaned.length >= 10) {
          phones.add(cleaned);
        }
      });
    }
  }

  return Array.from(phones);
}

/**
 * Extract email addresses from text
 */
export function extractEmails(text: string): string[] {
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const matches = text.match(emailPattern);
  return matches || [];
}

/**
 * Extract property-related numbers (beds, baths, price, sqft)
 */
export interface PropertyNumbers {
  beds?: number;
  baths?: number;
  price?: number;
  sqft?: number;
}

export function extractPropertyNumbers(text: string): PropertyNumbers {
  const result: PropertyNumbers = {};

  // Beds
  const bedsMatch = text.match(/(\d+)\s*bedroom?/i);
  if (bedsMatch) {
    result.beds = parseInt(bedsMatch[1]);
  }

  // Baths
  const bathsMatch = text.match(/(\d+(?:\.\d+)?)\s*bath/i);
  if (bathsMatch) {
    result.baths = parseFloat(bathsMatch[1]);
  }

  // Price
  const priceMatch = text.match(/\$?(\d{3,}(?:,\d{3})*)/);
  if (priceMatch) {
    result.price = parseInt(priceMatch[1].replace(/,/g, ''));
  }

  // Sqft
  const sqftMatch = text.match(/(\d{3,}(?:,\d{3})*)\s*sqft/i);
  if (sqftMatch) {
    result.sqft = parseInt(sqftMatch[1].replace(/,/g, ''));
  }

  return result;
}

/**
 * Detect conversation type (iOS, Android, WhatsApp, generic)
 */
export type ConversationType = 'ios' | 'android' | 'whatsapp' | 'generic';

export function detectConversationType(text: string): ConversationType {
  if (/Today\s+\d{1,2}:\d{2}\s*(AM|PM)/i.test(text)) {
    return 'ios';
  }
  if (/\d{1,2}\/\d{2}\/\d{2,4}/.test(text) && /^\d{1,2}:\d{2}\s*(AM|PM)/m.test(text)) {
    return 'android';
  }
  if (/\d{1,2}:\d{2}\s*(AM|PM)/i.test(text) && /encrypted|WhatsApp/i.test(text)) {
    return 'whatsapp';
  }
  return 'generic';
}

/**
 * Check if pattern detection is sufficient for the task
 */
export function isPatternDetectionSufficient(text: string): boolean {
  const patterns = detectPatterns(text);

  // Sufficient if we found clear patterns with high confidence
  return patterns.confidence >= 80;
}
