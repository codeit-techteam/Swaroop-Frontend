/**
 * Production notification copy helpers (B-04).
 * Sanitize API payloads so raw upload names / UUIDs never reach the buyer UI.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const RAW_FILE_RE =
  /\b(?:whatsapp\s*image[^.,]*|screenshot[^.,]*|img_\d+|dsc_?\d+|photo[-_ ]?\d+|qr[_-]?[a-z0-9_-]*)\.(?:jpe?g|png|gif|webp|heic|pdf)\b/gi;

const FILE_EXT_RE = /\b[\w .-]+\.(?:jpe?g|png|gif|webp|heic|pdf|docx?|xlsx?)\b/gi;

const CATEGORY_FROM_TYPE: Record<string, string> = {
  KYC_APPROVED: 'documents',
  KYC_REJECTED: 'documents',
  KYC_CHANGES_REQUESTED: 'documents',
  KYC_SUBMITTED: 'documents',
  KYC_RESUBMITTED: 'documents',
  DOCUMENT_APPROVED: 'documents',
  DOCUMENT_REJECTED: 'documents',
  DOCUMENT_VERIFIED: 'documents',
  PAN_VERIFIED: 'documents',
  GST_VERIFIED: 'documents',
  GSTIN_VERIFIED: 'documents',
};

const DOCUMENT_LABEL_BY_CATEGORY: Record<string, string> = {
  GST: 'GST certificate',
  PAN: 'PAN card',
  AADHAAR: 'Aadhaar card',
  BANK: 'bank document',
  KYC: 'KYC document',
  MSME: 'MSME certificate',
  INVOICE: 'invoice',
  GST_INVOICE: 'GST invoice',
  PAYMENT_PROOF: 'payment proof',
  CREDIT_APPLICATION: 'credit application',
  FINANCIAL_STATEMENT: 'financial statement',
  OTHER: 'document',
};

export function looksLikeRawUploadName(value: string | null | undefined): boolean {
  const name = String(value ?? '').trim();
  if (!name) return true;
  if (UUID_RE.test(name)) return true;
  if (/^[0-9a-f-]{20,}(\.[a-z0-9]+)?$/i.test(name)) return true;
  if (/\.(jpe?g|png|gif|webp|heic|pdf|docx?|xlsx?)$/i.test(name)) return true;
  if (/whatsapp\s*image|screenshot|img_\d+|dsc_?\d+|photo[-_ ]?\d+/i.test(name)) {
    return true;
  }
  return false;
}

export function resolveNotificationCategoryHint(
  metadata: Record<string, unknown>,
  title: string,
  entityType?: string | null,
): string | null {
  const type = typeof metadata.type === 'string' ? metadata.type.toUpperCase() : '';
  if (type && CATEGORY_FROM_TYPE[type]) {
    return CATEGORY_FROM_TYPE[type];
  }

  const normalized = title.toLowerCase();
  if (
    normalized.includes('kyc') ||
    normalized.includes('pan verified') ||
    normalized.includes('gstin verified') ||
    normalized.includes('gst verified') ||
    normalized.includes('aadhaar') ||
    normalized.includes('verification requires')
  ) {
    return 'documents';
  }

  if (entityType === 'CUSTOMER' || entityType === 'SELLER') {
    if (
      normalized.includes('document') ||
      normalized.includes('certificate') ||
      normalized.includes('verified') ||
      type.includes('KYC') ||
      type.includes('DOCUMENT')
    ) {
      return 'documents';
    }
  }

  return null;
}

function preferredDocumentLabel(metadata: Record<string, unknown>): string {
  const slotLabel = typeof metadata.slotLabel === 'string' ? metadata.slotLabel.trim() : '';
  if (slotLabel && !looksLikeRawUploadName(slotLabel)) return slotLabel;

  const documentLabel =
    typeof metadata.documentLabel === 'string' ? metadata.documentLabel.trim() : '';
  if (documentLabel && !looksLikeRawUploadName(documentLabel)) return documentLabel;

  const category =
    typeof metadata.documentCategory === 'string'
      ? metadata.documentCategory
      : typeof metadata.categoryCode === 'string'
        ? metadata.categoryCode
        : '';
  if (category && DOCUMENT_LABEL_BY_CATEGORY[category.toUpperCase()]) {
    return DOCUMENT_LABEL_BY_CATEGORY[category.toUpperCase()];
  }

  return 'document';
}

/**
 * Rewrite document bodies that embedded raw filenames / UUIDs.
 * Keeps rejection reasons and other human copy intact.
 */
export function formatNotificationDescription(
  title: string,
  body: string,
  metadata: Record<string, unknown> = {},
): string {
  let text = String(body ?? '').trim();
  if (!text) return String(title ?? '').trim() || 'You have a new update.';

  // Replace branded legacy copy.
  text = text.replace(/\bPetroTrade\b/g, 'PolyStoreX');

  const label = preferredDocumentLabel(metadata);
  const verifiedMatch = text.match(
    /^your document\s+(.+?)\s+was verified\.?$/i,
  );
  if (verifiedMatch) {
    const embedded = verifiedMatch[1]?.trim() ?? '';
    if (looksLikeRawUploadName(embedded) || UUID_RE.test(embedded)) {
      return label === 'document'
        ? 'Your document was verified.'
        : `Your ${label} was verified.`;
    }
  }

  const rejectedMatch = text.match(
    /^your document\s+(.+?)\s+was rejected:\s*(.+)$/i,
  );
  if (rejectedMatch) {
    const embedded = rejectedMatch[1]?.trim() ?? '';
    const reason = rejectedMatch[2]?.trim() || 'Please upload a replacement.';
    if (looksLikeRawUploadName(embedded) || UUID_RE.test(embedded)) {
      const subject = label === 'document' ? 'Your document' : `Your ${label}`;
      return `${subject} was rejected: ${reason}`;
    }
  }

  // Scrub leftover raw filenames / UUID tokens anywhere in the body.
  text = text.replace(RAW_FILE_RE, label === 'document' ? 'document' : label);
  text = text.replace(FILE_EXT_RE, (match) =>
    looksLikeRawUploadName(match) ? (label === 'document' ? 'document' : label) : match,
  );
  text = text.replace(
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
    '',
  );
  text = text.replace(/\s{2,}/g, ' ').replace(/\s+([.,])/g, '$1').trim();

  // Avoid empty / punctuation-only leftovers after scrubbing.
  if (!text || /^[.:\-–—]+$/.test(text)) {
    return label === 'document'
      ? 'Your document was verified.'
      : `Your ${label} was verified.`;
  }

  return text;
}

/** Never surface a UUID as the reference line under the title. */
export function sanitizeNotificationReference(
  value: string | null | undefined,
): string | undefined {
  const trimmed = String(value ?? '').trim();
  if (!trimmed || UUID_RE.test(trimmed) || looksLikeRawUploadName(trimmed)) {
    return undefined;
  }
  return trimmed;
}
