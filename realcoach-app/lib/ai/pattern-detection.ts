export interface ConversationPatterns {
  buyingIntent: boolean;
  sellingIntent: boolean;
  urgency: boolean;
  specificProperty: boolean;
  preapproval: boolean;
  showings: boolean;
  offerAccepted: boolean;
  closing: boolean;
}

export const detectConversationPatterns = (text: string): ConversationPatterns => {
  const patterns: ConversationPatterns = {
    buyingIntent: false,
    sellingIntent: false,
    urgency: false,
    specificProperty: false,
    preapproval: false,
    showings: false,
    offerAccepted: false,
    closing: false,
  };

  const lowerText = text.toLowerCase();

  patterns.buyingIntent =
    /looking to buy|want to purchase|interested in buying|buyer's agent|representing me/.test(lowerText);

  patterns.sellingIntent =
    /looking to sell|want to sell|thinking of selling|just listed|going to list|my home|my house/.test(lowerText);

  patterns.urgency =
    /asap|immediately|right now|urgent|as soon as possible/.test(lowerText);

  patterns.specificProperty =
    /in \w+ area|near|bedroom|bathroom|sqft|square foot|pool|garage|yard/.test(lowerText);

  patterns.preapproval =
    /pre-approval|pre-qualified|mortgage approval|lender|loan officer|pre-approved/.test(lowerText);

  patterns.showings =
    /saw \d+ home|showing|viewed|visited|tour|looking at homes|went to see/.test(lowerText);

  patterns.offerAccepted =
    /offer accepted|under contract|seller accepted|they accepted/.test(lowerText);

  patterns.closing =
    /closed|closing complete|got the keys|funding|documents signed|closing table/.test(lowerText);

  return patterns;
};
