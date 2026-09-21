export const ROUTES = {
  ROOT: '/',
  ONBOARDING: {
    SPLASH: '/(onboarding)/splash',
    INTRO_ONE: '/(onboarding)/intro-one',
    INTRO_TWO: '/(onboarding)/intro-two',
  },
  AUTH: {
    ROLE_SELECTION: '/(auth)/role-selection',
    CUSTOMER_LOGIN: '/(auth)/customer-login',
    CUSTOMER_REGISTER: '/(auth)/customer-register',
    OTP_VERIFICATION: '/(auth)/otp-verification',
    BUSINESS_INFORMATION: '/(auth)/business-information',
    KYC_DOCUMENTS: '/(auth)/kyc-documents',
    REVIEW_SUBMISSION: '/(auth)/review-submission',
    APPLICATION_SUBMITTED: '/(auth)/application-submitted',
  },
  CUSTOMER: {
    HOME: '/(customer)/(tabs)/home',
    MARKET: '/(customer)/(tabs)/market',
    ORDERS: '/(customer)/(tabs)/orders',
    PROFILE: '/(customer)/(tabs)/profile',
    PRODUCT_DETAILS: '/(customer)/product/[id]',
    CART: '/(customer)/cart',
    CHECKOUT: '/(customer)/checkout',
    PAYMENT: '/(customer)/payment',
    PAYMENT_COMPARE: '/(customer)/payment/compare',
    PAYMENT_UPLOAD_PROOF: '/(customer)/payment/upload-proof',
    PAYMENT_VERIFICATION_INITIATED: '/(customer)/payment/verification-initiated',
    ORDER_SUBMITTED: '/(customer)/order-submitted',
    CREDIT_APPROVAL: '/(customer)/credit-approval',
    CREDIT_INVOICE_DELIVERY: '/(customer)/credit-invoice-delivery',
    CREDIT_COUNTDOWN: '/(customer)/credit-countdown',
    CREDIT_PAYMENT_REMINDER: '/(customer)/credit-payment-reminder',
    CREDIT_UPLOAD_PROOF: '/(customer)/credit/upload-proof',
    CREDIT_VERIFICATION: '/(customer)/credit/verification',
    CREDIT_RESTORED: '/(customer)/credit-restored',
    LOADING_SCHEDULED: '/(customer)/loading-scheduled',
    LOADING_COMPLETED: '/(customer)/loading-completed',
    PAYMENT_REMINDER: '/(customer)/payment-reminder',
    PAYMENT_SUCCESS: '/(customer)/payment-success',
    PROCUREMENT_CONFIRMATION: '/(customer)/procurement/confirmation',
    ORDER_AWAITING_CONFIRMATION: '/(customer)/order-awaiting-confirmation',
    PURCHASE_ORDER_GENERATED: '/(customer)/purchase-order-generated',
    DISPATCH_PLANNING: '/(customer)/dispatch-planning',
    DISPATCH_STARTED: '/(customer)/dispatch-started',
    DELIVERY_COMPLETED: '/(customer)/delivery-completed',
    SHIPMENT_TRACKING: '/(customer)/shipment-tracking',
    ORDER_DETAIL: '/(customer)/order-detail',
    ORDER_CONFIRMATION: '/(customer)/order-confirmation',
    PURCHASE_REQUEST_SUCCESS: '/(customer)/purchase-request-success',
    DASHBOARD: '/(customer)/(tabs)/home',
    PROFILE_EDIT: '/(customer)/profile/edit',
    PROFILE_COMPANY_DETAILS: '/(customer)/profile/company-details',
    PROFILE_SAVED_ADDRESSES: '/(customer)/profile/saved-addresses',
    PROFILE_ADDRESS_FORM: '/(customer)/profile/address-form',
    PROFILE_BANK_ACCOUNTS: '/(customer)/profile/bank-accounts',
    PROFILE_TAX_DOCUMENTS: '/(customer)/profile/tax-documents',
    BULK_LOGISTICS_QUOTE: '/(customer)/profile/bulk-logistics-quote',
    NOTIFICATIONS: '/(customer)/notifications',
  },
  SELLER: {
    LOGIN: '/(seller)/login',
    OTP: '/(seller)/otp',
    COMPANY: '/(seller)/company',
    VERIFICATION: '/(seller)/verification',
    REVIEW: '/(seller)/review',
    VERIFICATION_SUBMITTED: '/(seller)/verification-submitted',
    DASHBOARD: '/(seller)/dashboard',
    ADD_PRODUCT: '/(seller)/add-product',
    PRODUCT_PUBLISHED: '/(seller)/product-published',
    INVENTORY: '/(seller)/inventory',
    INVENTORY_HISTORY: '/(seller)/inventory-history',
    INVENTORY_SUCCESS: '/(seller)/inventory-success',
    PRODUCTS: '/(seller)/products',
    PRODUCT_DETAIL: '/(seller)/product-detail',
    EDIT_PRODUCT: '/(seller)/edit-product',
    ORDERS: '/(seller)/orders',
    ORDER_ELIGIBILITY: '/(seller)/order-eligibility',
    ORDER_ACCEPTED: '/(seller)/order-accepted',
    ORDER_REJECTED: '/(seller)/order-rejected',
    CUSTOMERS: '/(seller)/customers',
    SETTLEMENTS: '/(seller)/settlements',
    SETTLEMENT_DETAILS: '/(seller)/settlement-details',
    SETTLEMENT_RELEASED: '/(seller)/settlement-released',
    SETTLEMENT_HISTORY: '/(seller)/settlement-history',
    SETTLEMENT_DOCUMENTS: '/(seller)/settlement-documents',
    WAREHOUSE: '/(seller)/warehouse',
    DISPATCH: '/(seller)/dispatch',
    DISPATCH_DETAIL: '/(seller)/dispatch-detail',
    DISPATCH_MANAGEMENT: '/(seller)/dispatch-management',
    ASSIGN_VEHICLE: '/(seller)/assign-vehicle',
    INVOICE_GENERATED: '/(seller)/invoice-generated',
    DISPATCH_READY: '/(seller)/dispatch-ready',
    DISPATCH_SUCCESS: '/(seller)/dispatch-success',
    ANALYTICS: '/(seller)/analytics',
    SUPPORT: '/(seller)/support',
    SETTINGS: '/(seller)/settings',
    NOTIFICATIONS: '/(seller)/notifications',
    PROFILE: '/(seller)/profile',
    PROFILE_EDIT: '/(seller)/profile-edit',
    PROFILE_COMPANY: '/(seller)/profile-company',
    PROFILE_ADDRESS: '/(seller)/profile-address',
    PROFILE_GST: '/(seller)/profile-gst',
    PROFILE_BANK: '/(seller)/profile-bank',
    PROFILE_KYC: '/(seller)/profile-kyc',
    PROFILE_TRADE_LICENSES: '/(seller)/profile-trade-licenses',
    PROFILE_DOCUMENTS: '/(seller)/profile-documents',
    PROFILE_SECURITY: '/(seller)/profile-security',
    SHIPMENTS: '/(seller)/shipments',
    SHIPMENT_DETAILS: '/(seller)/shipment-details',
    OFFERS: '/(seller)/offers',
    CREATE_OFFER: '/(seller)/create-offer',
    EDIT_OFFER: '/(seller)/edit-offer',
    OFFER_PREVIEW: '/(seller)/offer-preview',
    OFFER_REVIEW_STATUS: '/(seller)/offer-review-status',
    OFFER_DETAILS: '/(seller)/offer-details',
    OFFER_APPROVED: '/(seller)/offer-approved',
    OFFER_PAUSED: '/(seller)/offer-paused',
    OFFER_EXPIRED: '/(seller)/offer-expired',
    SEARCH: '/(seller)/search',
    RAISE_TICKET: '/(seller)/raise-ticket',
  },

  PUBLIC: {
    ROOT: '/(public)',
  },
  PRIVATE: {
    ROOT: '/(private)',
  },
} as const;

export type OnboardingRoute =
  | typeof ROUTES.ONBOARDING.SPLASH
  | typeof ROUTES.ONBOARDING.INTRO_ONE
  | typeof ROUTES.ONBOARDING.INTRO_TWO;

export type AuthRoute =
  | typeof ROUTES.AUTH.ROLE_SELECTION
  | typeof ROUTES.AUTH.CUSTOMER_LOGIN
  | typeof ROUTES.AUTH.CUSTOMER_REGISTER
  | typeof ROUTES.AUTH.OTP_VERIFICATION
  | typeof ROUTES.AUTH.BUSINESS_INFORMATION
  | typeof ROUTES.AUTH.KYC_DOCUMENTS
  | typeof ROUTES.AUTH.REVIEW_SUBMISSION
  | typeof ROUTES.AUTH.APPLICATION_SUBMITTED;

export type CustomerRoute =
  | typeof ROUTES.CUSTOMER.HOME
  | typeof ROUTES.CUSTOMER.MARKET
  | typeof ROUTES.CUSTOMER.ORDERS
  | typeof ROUTES.CUSTOMER.PROFILE
  | typeof ROUTES.CUSTOMER.PRODUCT_DETAILS
  | typeof ROUTES.CUSTOMER.CART
  | typeof ROUTES.CUSTOMER.CHECKOUT
  | typeof ROUTES.CUSTOMER.PAYMENT
  | typeof ROUTES.CUSTOMER.PAYMENT_COMPARE
  | typeof ROUTES.CUSTOMER.PAYMENT_UPLOAD_PROOF
  | typeof ROUTES.CUSTOMER.PAYMENT_VERIFICATION_INITIATED
  | typeof ROUTES.CUSTOMER.ORDER_SUBMITTED
  | typeof ROUTES.CUSTOMER.CREDIT_APPROVAL
  | typeof ROUTES.CUSTOMER.CREDIT_INVOICE_DELIVERY
  | typeof ROUTES.CUSTOMER.CREDIT_COUNTDOWN
  | typeof ROUTES.CUSTOMER.CREDIT_PAYMENT_REMINDER
  | typeof ROUTES.CUSTOMER.CREDIT_UPLOAD_PROOF
  | typeof ROUTES.CUSTOMER.CREDIT_VERIFICATION
  | typeof ROUTES.CUSTOMER.CREDIT_RESTORED
  | typeof ROUTES.CUSTOMER.LOADING_SCHEDULED
  | typeof ROUTES.CUSTOMER.LOADING_COMPLETED
  | typeof ROUTES.CUSTOMER.PAYMENT_REMINDER
  | typeof ROUTES.CUSTOMER.PAYMENT_SUCCESS
  | typeof ROUTES.CUSTOMER.PROCUREMENT_CONFIRMATION
  | typeof ROUTES.CUSTOMER.ORDER_AWAITING_CONFIRMATION
  | typeof ROUTES.CUSTOMER.PURCHASE_ORDER_GENERATED
  | typeof ROUTES.CUSTOMER.DISPATCH_PLANNING
  | typeof ROUTES.CUSTOMER.DISPATCH_STARTED
  | typeof ROUTES.CUSTOMER.DELIVERY_COMPLETED
  | typeof ROUTES.CUSTOMER.SHIPMENT_TRACKING
  | typeof ROUTES.CUSTOMER.ORDER_DETAIL
  | typeof ROUTES.CUSTOMER.ORDER_CONFIRMATION
  | typeof ROUTES.CUSTOMER.PURCHASE_REQUEST_SUCCESS
  | typeof ROUTES.CUSTOMER.DASHBOARD
  | typeof ROUTES.CUSTOMER.PROFILE_EDIT
  | typeof ROUTES.CUSTOMER.PROFILE_COMPANY_DETAILS
  | typeof ROUTES.CUSTOMER.PROFILE_SAVED_ADDRESSES
  | typeof ROUTES.CUSTOMER.PROFILE_ADDRESS_FORM
  | typeof ROUTES.CUSTOMER.PROFILE_BANK_ACCOUNTS
  | typeof ROUTES.CUSTOMER.PROFILE_TAX_DOCUMENTS
  | typeof ROUTES.CUSTOMER.BULK_LOGISTICS_QUOTE
  | typeof ROUTES.CUSTOMER.NOTIFICATIONS;

export type SellerRoute =
  | typeof ROUTES.SELLER.LOGIN
  | typeof ROUTES.SELLER.OTP
  | typeof ROUTES.SELLER.COMPANY
  | typeof ROUTES.SELLER.VERIFICATION
  | typeof ROUTES.SELLER.REVIEW
  | typeof ROUTES.SELLER.VERIFICATION_SUBMITTED
  | typeof ROUTES.SELLER.DASHBOARD
  | typeof ROUTES.SELLER.ADD_PRODUCT
  | typeof ROUTES.SELLER.PRODUCT_PUBLISHED
  | typeof ROUTES.SELLER.INVENTORY
  | typeof ROUTES.SELLER.INVENTORY_HISTORY
  | typeof ROUTES.SELLER.INVENTORY_SUCCESS
  | typeof ROUTES.SELLER.PRODUCTS
  | typeof ROUTES.SELLER.PRODUCT_DETAIL
  | typeof ROUTES.SELLER.EDIT_PRODUCT
  | typeof ROUTES.SELLER.ORDERS
  | typeof ROUTES.SELLER.ORDER_ELIGIBILITY
  | typeof ROUTES.SELLER.ORDER_ACCEPTED
  | typeof ROUTES.SELLER.ORDER_REJECTED
  | typeof ROUTES.SELLER.CUSTOMERS
  | typeof ROUTES.SELLER.SETTLEMENTS
  | typeof ROUTES.SELLER.SETTLEMENT_DETAILS
  | typeof ROUTES.SELLER.SETTLEMENT_RELEASED
  | typeof ROUTES.SELLER.SETTLEMENT_HISTORY
  | typeof ROUTES.SELLER.SETTLEMENT_DOCUMENTS
  | typeof ROUTES.SELLER.WAREHOUSE
  | typeof ROUTES.SELLER.DISPATCH
  | typeof ROUTES.SELLER.DISPATCH_DETAIL
  | typeof ROUTES.SELLER.DISPATCH_MANAGEMENT
  | typeof ROUTES.SELLER.ASSIGN_VEHICLE
  | typeof ROUTES.SELLER.INVOICE_GENERATED
  | typeof ROUTES.SELLER.DISPATCH_READY
  | typeof ROUTES.SELLER.DISPATCH_SUCCESS
  | typeof ROUTES.SELLER.ANALYTICS
  | typeof ROUTES.SELLER.SUPPORT
  | typeof ROUTES.SELLER.SETTINGS
  | typeof ROUTES.SELLER.NOTIFICATIONS
  | typeof ROUTES.SELLER.PROFILE
  | typeof ROUTES.SELLER.PROFILE_EDIT
  | typeof ROUTES.SELLER.PROFILE_COMPANY
  | typeof ROUTES.SELLER.PROFILE_ADDRESS
  | typeof ROUTES.SELLER.PROFILE_GST
  | typeof ROUTES.SELLER.PROFILE_BANK
  | typeof ROUTES.SELLER.PROFILE_KYC
  | typeof ROUTES.SELLER.PROFILE_TRADE_LICENSES
  | typeof ROUTES.SELLER.PROFILE_DOCUMENTS
  | typeof ROUTES.SELLER.PROFILE_SECURITY
  | typeof ROUTES.SELLER.SHIPMENTS
  | typeof ROUTES.SELLER.SHIPMENT_DETAILS
  | typeof ROUTES.SELLER.OFFERS
  | typeof ROUTES.SELLER.CREATE_OFFER
  | typeof ROUTES.SELLER.EDIT_OFFER
  | typeof ROUTES.SELLER.OFFER_PREVIEW
  | typeof ROUTES.SELLER.OFFER_REVIEW_STATUS
  | typeof ROUTES.SELLER.OFFER_DETAILS
  | typeof ROUTES.SELLER.OFFER_APPROVED
  | typeof ROUTES.SELLER.OFFER_PAUSED
  | typeof ROUTES.SELLER.OFFER_EXPIRED;

export type PublicRoute = typeof ROUTES.PUBLIC.ROOT;

export type PrivateRoute = typeof ROUTES.PRIVATE.ROOT;

export const isOnboardingRoute = (pathname: string): boolean =>
  pathname.startsWith('/(onboarding)');

export const isAuthRoute = (pathname: string): boolean => pathname.startsWith('/(auth)');

export const isCustomerRoute = (pathname: string): boolean => pathname.startsWith('/(customer)');

export const isSellerRoute = (pathname: string): boolean => pathname.startsWith('/(seller)');

export const isPublicRoute = (pathname: string): boolean => pathname.startsWith('/(public)');

export const isPrivateRoute = (pathname: string): boolean => pathname.startsWith('/(private)');
