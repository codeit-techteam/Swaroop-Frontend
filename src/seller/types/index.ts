export type SellerRole = 'seller';

export type SellerStepId = 'company' | 'verification' | 'review';

export type SellerDocumentId = 'gst' | 'pan' | 'aadhaar' | 'cancelledCheque';

export type SellerDocumentStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

/** Admin review state of a stored onboarding document. */
export type SellerDocumentReviewStatus = 'pending_review' | 'verified' | 'rejected';

export type SellerEntityType =
  'Proprietorship' | 'Partnership' | 'LLP' | 'Private Limited' | 'Public Limited';

export type SellerCompany = {
  companyName: string;
  gst: string;
  pan: string;
  gstVerified: boolean;
  gstStateCode: string;
  gstState: string;
  entityType: string;
  businessEmail: string;
  mobile: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  natureOfBusiness: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
};

export type SellerBankDetails = Pick<
  SellerCompany,
  'accountHolderName' | 'bankName' | 'accountNumber' | 'ifscCode'
>;

export type SellerDocumentFile = {
  name: string;
  uri: string;
  size: number;
  mimeType?: string | null;
};

export type SellerDocument = {
  id: SellerDocumentId;
  title: string;
  subtitle: string;
  required: boolean;
  status: SellerDocumentStatus;
  progress: number;
  file?: SellerDocumentFile;
  errorMessage?: string;
  /** Backend document id once the file is confirmed in R2. */
  remoteId?: string;
  reviewStatus?: SellerDocumentReviewStatus;
};

export type SellerMenuSection =
  | 'dashboard'
  | 'inventory'
  | 'products'
  | 'orders'
  | 'customers'
  | 'settlements'
  | 'warehouse'
  | 'dispatch'
  | 'analytics'
  | 'support'
  | 'settings';

export type SellerProfile = {
  ownerName: string;
  companyInitials: string;
};

export type SellerShipmentStatus = 'On Time' | 'In Transit' | 'Delayed';

export type SellerShipment = {
  id: string;
  shipmentId: string;
  route: string;
  status: SellerShipmentStatus;
  eta: string;
};

export type SellerStat = {
  id: string;
  label: string;
  value: number;
};

export type SellerQuickActionId = 'add-product' | 'update-stock' | 'offers' | 'dispatch';

export type SellerProductStatus = 'draft' | 'published' | 'inactive';

export type SellerPaymentPricing = {
  sellingPrice: string;
};

export type SellerPricingTier = {
  id: string;
  minQty: string;
  maxQty: string;
  price: string;
  discountLabel: string;
};

export type SellerTechnicalSpecs = {
  mfi: string;
  density: string;
  primaryApplication: string;
  technicalDatasheetName: string;
  qualityCertificateName: string;
};

export type SellerProductForm = {
  name: string;
  grade: string;
  category: string;
  brand: string;
  origin: string;
  description: string;
  availableQty: string;
  moq: string;
  warehouseLocation: string;
  polymerType: string;
  packagingType: string;
  unit: string;
  currency: string;
  gstPercent: string;
  reservedQty: string;
  /** Customer marketplace SKU id (`mkt-*`) so listings stay aligned with CX catalog. */
  catalogProductId: string;
};

export type SellerProduct = {
  id: string;
  productId: string;
  status: SellerProductStatus;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  form: SellerProductForm;
  pricing: SellerPaymentPricing;
  tiers: SellerPricingTier[];
  technicalSpecs: SellerTechnicalSpecs;
};

export type SellerDraftProduct = SellerProduct;

export type SellerProductSnapshot = {
  products: SellerProduct[];
  draftProducts: SellerDraftProduct[];
  publishedProducts: SellerProduct[];
  inactiveProducts: SellerProduct[];
  selectedProductId: string | null;
  form: SellerProductForm;
  pricing: SellerPaymentPricing;
  tiers: SellerPricingTier[];
  technicalSpecs: SellerTechnicalSpecs;
  dashboardStats: SellerStat[];
  shipments: SellerShipment[];
  revenueToday: string;
  revenueDelta: string;
  pendingSettlement: string;
  overdueCount: number;
};

export type SellerSnapshot = {
  sellerRole: SellerRole;
  sellerLoggedIn: boolean;
  sellerProfileCompleted: boolean;
  verificationSubmitted: boolean;
  dashboardAccess: boolean;
  otpVerified: boolean;
  mobile: string;
  company: SellerCompany;
  documents: SellerDocument[];
  profile: SellerProfile;
};

export type SellerStoreState = SellerSnapshot & {
  isHydrated: boolean;
};

export type SellerStoreActions = {
  hydrateSellerSession: () => void;
  setMobile: (mobile: string) => void;
  markOtpVerified: () => void;
  saveCompany: (company: SellerCompany) => void;
  setDocument: (documentId: SellerDocumentId, patch: Partial<SellerDocument>) => void;
  submitVerification: () => void;
  logoutSeller: () => void;
};

export type SellerStore = SellerStoreState & SellerStoreActions;

export type SellerProductStoreState = SellerProductSnapshot & {
  isHydrated: boolean;
  formErrors: Partial<
    Record<keyof SellerProductForm | keyof SellerTechnicalSpecs | 'sellingPrice', string>
  >;
};

export type SellerProductStoreActions = {
  hydrateProductState: () => void;
  /** Replace products from production seller API (keeps editor/dashboard fields). */
  hydrateFromApi: () => Promise<void>;
  refreshFromApi: () => Promise<void>;
  updateFormField: <K extends keyof SellerProductForm>(field: K, value: SellerProductForm[K]) => void;
  updatePricingField: <K extends keyof SellerPaymentPricing>(
    field: K,
    value: SellerPaymentPricing[K],
  ) => void;
  updateTechnicalSpecField: <K extends keyof SellerTechnicalSpecs>(
    field: K,
    value: SellerTechnicalSpecs[K],
  ) => void;
  addTier: () => void;
  updateTier: (tierId: string, patch: Partial<SellerPricingTier>) => void;
  deleteTier: (tierId: string) => void;
  moveTier: (tierId: string, direction: 'up' | 'down') => void;
  validateProductForm: (mode: 'draft' | 'publish') => boolean;
  saveDraftProduct: () => { success: boolean; productId?: string };
  publishProduct: () => { success: boolean; productId?: string };
  editProduct: (productId: string) => void;
  applyCatalogGrade: (catalogId: string) => boolean;
  clearSelection: () => void;
  duplicateProduct: (productId: string) => void;
  deleteProduct: (productId: string) => void;
  deactivateProduct: (productId: string) => void;
  updateStock: (productId: string, newStock: string, warehouse: string) => void;
};

export type SellerProductStore = SellerProductStoreState & SellerProductStoreActions;

export type InventoryCategory = 'Polymer' | 'Chemicals' | 'Speciality' | 'Lubricants';

export type InventoryStatus = 'normal' | 'low_stock' | 'out_of_stock';

export type WarehouseOption =
  | 'Main Warehouse'
  | 'Hazira'
  | 'JNPT'
  | 'Bhiwandi'
  | 'Mundra';

export type StockAdjustmentReason =
  | 'New Procurement'
  | 'Inventory Adjustment'
  | 'Quality Hold'
  | 'Damage'
  | 'Manual Correction';

export type InventoryProduct = {
  id: string;
  sellerProductId?: string;
  productName: string;
  grade: string;
  brand: string;
  category: InventoryCategory;
  subcategory: string;
  warehouse: WarehouseOption;
  activeOffer: boolean;
  availableStock: number;
  reservedStock: number;
  offeredStock: number;
  remainingStock: number;
  status: InventoryStatus;
  updatedAt: string;
};

export type InventorySummary = {
  totalProducts: number;
  activeOffers: number;
  lowStock: number;
  outOfStock: number;
};

export type StockHistoryEntry = {
  id: string;
  productId: string;
  productName: string;
  warehouse: WarehouseOption;
  added: number;
  reduced: number;
  reason: StockAdjustmentReason;
  updatedBy: string;
  updatedAt: string;
  oldStock: number;
  newStock: number;
};

export type InventorySnapshot = {
  products: InventoryProduct[];
  warehouses: WarehouseOption[];
  inventorySummary: InventorySummary;
  selectedProductId: string | null;
  stockHistory: StockHistoryEntry[];
};

export type InventoryStoreState = InventorySnapshot & {
  isHydrated: boolean;
};

export type InventoryUpdateInput = {
  productId: string;
  warehouse: WarehouseOption;
  addStock: number;
  reduceStock: number;
  reason: StockAdjustmentReason;
  updatedBy: string;
};

export type InventoryStoreActions = {
  hydrateInventoryState: () => void;
  /** Replace inventory products from production seller API. */
  hydrateFromApi: () => Promise<void>;
  refreshFromApi: () => Promise<void>;
  selectProduct: (productId: string | null) => void;
  refreshInventoryCatalog: () => void;
  updateStock: (input: InventoryUpdateInput) => StockHistoryEntry | null;
  reserveStockForOrder: (productId: string, quantityMt: number) => boolean;
};

export type InventoryStore = InventoryStoreState & InventoryStoreActions;
