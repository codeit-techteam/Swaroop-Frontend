export type FulfilmentInfo = {
  warehouse: { label: string; city: string | null; state: string | null } | null;
  origin: string | null;
  dispatchWindow: { label: string; source: string } | null;
  deliveryEstimate: { label: string; source: string } | null;
  destinationAware: boolean;
  hsnCode: string | null;
};

export type DeliveryEstimateStatus = 'ready' | 'need_pincode' | 'unavailable';

export type DeliveryEstimateCopy = {
  status: DeliveryEstimateStatus;
  label: string;
};

export function hasDestinationPincode(value?: string | null): boolean {
  return Boolean(value && /^\d{6}$/.test(value.replace(/\D/g, '').slice(0, 6)));
}

/**
 * Compact delivery copy. Backend always supplies a calculated or seller ETA on
 * marketplace listings; clients only prompt for pincode / unavailable when the
 * fulfilment payload is missing entirely.
 */
export function deliveryEstimateCopy(input: {
  fulfilment?: FulfilmentInfo | null;
  destinationPincode?: string | null;
}): DeliveryEstimateCopy {
  const sellerEstimate = input.fulfilment?.deliveryEstimate?.label?.trim();
  if (sellerEstimate) {
    return { status: 'ready', label: sellerEstimate };
  }
  if (!hasDestinationPincode(input.destinationPincode)) {
    return {
      status: 'need_pincode',
      label: 'Enter delivery pincode for an estimate.',
    };
  }
  return { status: 'unavailable', label: 'Delivery estimate unavailable' };
}

export function dispatchWindowCopy(fulfilment?: FulfilmentInfo | null): string {
  return fulfilment?.dispatchWindow?.label?.trim() || 'Dispatch time unavailable';
}

export function fulfilmentWarehouseCopy(fulfilment?: FulfilmentInfo | null): string | null {
  return fulfilment?.warehouse?.label?.trim() || null;
}
