export type DocumentStatus = 'verified' | 'pending' | 'rejected' | 'expired';

export type DocumentCategory =
  | 'certificate'
  | 'invoice'
  | 'settlement'
  | 'purchase_order'
  | 'eway_bill'
  | 'compliance';

export type DocumentFilterTab = 'all' | 'verified' | 'pending' | 'invoices' | 'certificates';

export type SellerDocumentItem = {
  id: string;
  name: string;
  section: string;
  category: DocumentCategory;
  status: DocumentStatus;
  uploadDate: string;
  fileSize: string;
  fileType: 'pdf' | 'image';
  previewUri: string;
  downloadUri: string;
};

export type DocumentsSnapshot = {
  documents: SellerDocumentItem[];
  totalCount: number;
  page: number;
  hasMore: boolean;
};
