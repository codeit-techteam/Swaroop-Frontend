import type { GradeRequestUnit } from '@/types/grade-request';

export type GradeRequestFormValues = {
  gradeName: string;
  materialCategory: string;
  manufacturer: string;
  gradeGroup: string;
  application: string;
  technicalSpecs: string;
  quantity: string;
  unit: GradeRequestUnit;
  deliveryLocation: string;
  deliveryPincode: string;
  requiredByDate: string; // YYYY-MM-DD or ''
  preferredPackaging: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  remarks: string;
};

export type GradeRequestFormErrors = Partial<Record<keyof GradeRequestFormValues, string>>;

export const EMPTY_GRADE_REQUEST_FORM: GradeRequestFormValues = {
  gradeName: '',
  materialCategory: '',
  manufacturer: '',
  gradeGroup: '',
  application: '',
  technicalSpecs: '',
  quantity: '',
  unit: 'MT',
  deliveryLocation: '',
  deliveryPincode: '',
  requiredByDate: '',
  preferredPackaging: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  remarks: '',
};

export const digitsOnly = (value: string, max: number): string =>
  value.replace(/\D/g, '').slice(0, max);

/** Keeps digits and one decimal point (quantity entry). */
export const decimalOnly = (value: string, max = 12): string => {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  return (rest.length ? `${whole}.${rest.join('')}` : whole).slice(0, max);
};

export const todayIso = (now: Date = new Date()): string => {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const normalizeIndianMobile = (value: string): string | null => {
  const compact = value.replace(/[\s-]/g, '');
  const m = /^(?:\+?91)?([6-9][0-9]{9})$/.exec(compact);
  return m ? m[1] : null;
};

export const validateGradeRequestForm = (
  f: GradeRequestFormValues,
  now: Date = new Date(),
): GradeRequestFormErrors => {
  const e: GradeRequestFormErrors = {};
  if (f.gradeName.trim().length < 2) e.gradeName = 'Enter the grade name or number.';
  if (f.materialCategory.trim().length < 2) e.materialCategory = 'Enter the material or category.';

  const qty = Number(f.quantity);
  if (!f.quantity.trim() || !Number.isFinite(qty) || qty <= 0) {
    e.quantity = 'Enter a quantity greater than zero.';
  } else if (qty > 1_000_000) {
    e.quantity = 'Quantity is too large.';
  }

  if (f.deliveryLocation.trim().length < 3) e.deliveryLocation = 'Enter the delivery location.';
  if (f.deliveryPincode && !/^[1-9][0-9]{5}$/.test(f.deliveryPincode)) {
    e.deliveryPincode = 'Enter a valid 6-digit pincode.';
  }
  if (f.requiredByDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.requiredByDate)) {
      e.requiredByDate = 'Use the format YYYY-MM-DD.';
    } else if (f.requiredByDate < todayIso(now)) {
      e.requiredByDate = 'Required-by date cannot be in the past.';
    }
  }
  if (f.contactName.trim().length < 2) e.contactName = 'Enter a contact name.';
  if (!normalizeIndianMobile(f.contactPhone)) {
    e.contactPhone = 'Enter a valid 10-digit mobile number.';
  }
  if (f.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.contactEmail)) {
    e.contactEmail = 'Enter a valid email address.';
  }
  return e;
};
