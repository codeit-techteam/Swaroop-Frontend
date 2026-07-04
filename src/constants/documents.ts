import type { DocumentItem, StepperStep, StepperStepStatus, TimelineStep } from '@/types/document';
import type { BusinessInformation, CompanyType } from '@/types/kyc';

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/png', 'image/jpeg'] as const;

export const COMPANY_TYPE_OPTIONS: CompanyType[] = [
  'Proprietorship',
  'Partnership',
  'LLP',
  'Private Limited',
  'Public Limited',
  'OPC',
];

export const NATURE_OF_BUSINESS_OPTIONS = [
  'Petrochemical Trading',
  'Industrial Chemicals',
  'Polymer Distribution',
  'Oil & Gas Logistics',
  'Manufacturing',
  'Import / Export',
  'Other',
] as const;

export const INDIAN_STATES: Record<string, string[]> = {
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  Delhi: ['New Delhi', 'Dwarka', 'Rohini', 'Saket'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
  'Uttar Pradesh': ['Lucknow', 'Noida', 'Kanpur', 'Ghaziabad'],
  'West Bengal': [
    'Kolkata',
    'Howrah',
    'Durgapur',
    'Asansol',
    'Kalyani',
    'Siliguri',
    'Bardhaman',
    'Haldia',
  ],
  Haryana: ['Gurugram', 'Faridabad', 'Panipat'],
};

export const STATE_OPTIONS = Object.keys(INDIAN_STATES);

export const EMPTY_BUSINESS_INFO: BusinessInformation = {
  businessEntityName: '',
  companyType: '',
  gstNumber: '',
  panNumber: '',
  businessEmail: '',
  mobileNumber: '',
  businessAddress: '',
  state: '',
  city: '',
  pincode: '',
  natureOfBusiness: '',
  annualPurchaseVolume: '',
  expectedMonthlyRequirement: '',
};

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'pan',
    title: 'PAN Card',
    description: 'Permanent Account Number issued by the Income Tax Department.',
    status: 'idle',
    progress: 0,
    required: true,
  },
  {
    id: 'gst',
    title: 'GST Certificate',
    description: 'Goods and Services Tax Registration Certificate.',
    status: 'idle',
    progress: 0,
    required: true,
  },
  {
    id: 'aadhaar',
    title: 'Aadhaar Card (Authorized Person)',
    description: 'Government identity proof of the authorized business representative.',
    status: 'idle',
    progress: 0,
    required: true,
  },
  {
    id: 'cancelled_cheque',
    title: 'Cancelled Cheque',
    description: 'Cancelled cheque of the registered business bank account.',
    status: 'idle',
    progress: 0,
    required: false,
  },
];


export const MANDATORY_DOCUMENT_IDS = ['pan', 'gst', 'aadhaar'] as const;

export const getKycStepperSteps = (
  current: 'basic-info' | 'documents' | 'review',
): StepperStep[] => {
  const order = ['basic-info', 'documents', 'review'] as const;
  const labels = {
    'basic-info': 'Basic Info',
    documents: 'Documents',
    review: 'Review',
  };

  return order.map((id) => {
    const currentIndex = order.indexOf(current);
    const stepIndex = order.indexOf(id);
    let status: StepperStepStatus = 'upcoming';
    if (stepIndex < currentIndex) {
      status = 'completed';
    } else if (stepIndex === currentIndex) {
      status = 'current';
    }
    return { id, label: labels[id], status };
  });
};

export const generateKycReferenceId = (): string => {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `PT-KYC-${suffix}`;
};

export const buildSubmissionTimeline = (): TimelineStep[] => [
  {
    id: 'verification',
    title: 'Document Verification',
    description: 'Compliance team is reviewing your files.',
    status: 'in_progress',
    meta: 'In Progress — Est. 24-48 hours',
  },
  {
    id: 'activation',
    title: 'Account Activation',
    description: 'Receive trading credentials via email.',
    status: 'pending',
  },
];

export const SUPPORT_PHONE = '1-800-555-PETRO';
