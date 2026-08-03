import type { SellerDocumentItem } from '@/seller/types/documents';

const DOCUMENT_SECTIONS = [
  'GST Certificate',
  'PAN Card',
  'Trade License',
  'Quality Certificate',
  'COA',
  'TDS',
  'Invoices',
  'Settlement Advice',
  'Purchase Orders',
  'E-Way Bills',
] as const;

const STATUSES = ['verified', 'pending', 'rejected', 'expired'] as const;

const MOCK_PREVIEW = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80';

function buildDocument(index: number, section: string): SellerDocumentItem {
  const status = STATUSES[index % STATUSES.length];
  const isPdf = index % 3 !== 0;
  const category =
    section.includes('Invoice') || section.includes('Settlement') || section.includes('Purchase')
      ? 'invoice'
      : section.includes('E-Way')
        ? 'eway_bill'
        : section.includes('TDS')
          ? 'compliance'
          : 'certificate';

  return {
    id: `doc-${index + 1}`,
    name: `${section} ${String(index + 1).padStart(3, '0')}`,
    section,
    category:
      category === 'invoice' && section.includes('Settlement')
        ? 'settlement'
        : category === 'invoice' && section.includes('Purchase')
          ? 'purchase_order'
          : category,
    status,
    uploadDate: new Date(2025, index % 12, (index % 28) + 1).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    fileSize: `${(1.2 + (index % 5) * 0.4).toFixed(1)} MB`,
    fileType: isPdf ? 'pdf' : 'image',
    previewUri: isPdf ? MOCK_PREVIEW : MOCK_PREVIEW,
    downloadUri: MOCK_PREVIEW,
  };
}

export const MOCK_DOCUMENTS: SellerDocumentItem[] = Array.from({ length: 60 }, (_, index) => {
  const section = DOCUMENT_SECTIONS[index % DOCUMENT_SECTIONS.length];
  return buildDocument(index, section);
});

export const DOCUMENT_FILTER_LABELS: Record<string, string> = {
  all: 'All',
  verified: 'Verified',
  pending: 'Pending',
  invoices: 'Invoices',
  certificates: 'Certificates',
};

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  verified: 'Verified',
  pending: 'Pending',
  rejected: 'Rejected',
  expired: 'Expired',
};
