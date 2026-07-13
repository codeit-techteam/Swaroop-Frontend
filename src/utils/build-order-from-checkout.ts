import { getPaymentMethodById } from '@/constants/payment';
import { createOrderId } from '@/store/order-store';
import type { CheckoutShippingAddress } from '@/types/checkout';
import type { CartItem } from '@/types/product';
import type { Order } from '@/types/order';
import type { PaymentCalculation } from '@/types/payment';

const toTitleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const buildBlindProductName = (productType: string, name: string): string => {
  const typeLabel = toTitleCase(productType.replace(/_/g, ' '));
  const suffix = name.replace(/^PP\s+[A-Z0-9]+\s*/i, '').trim();
  if (suffix) {
    return `${typeLabel} (PP) ${suffix}`;
  }
  return `${typeLabel} (PP)`;
};

const mapProductCategory = (productType: string): Order['productCategory'] => {
  const normalized = productType.toUpperCase();
  if (normalized.includes('PVC')) return 'PVC';
  if (normalized.includes('HDPE')) return 'HDPE';
  if (normalized.includes('LLDPE')) return 'LLDPE';
  if (normalized.includes('PET')) return 'PET';
  return 'PP';
};

export const buildOrderFromCheckout = (
  cartItems: CartItem[],
  shippingAddress: CheckoutShippingAddress,
  payment: PaymentCalculation,
): Order | null => {
  const primary = cartItems[0];
  if (!primary) {
    return null;
  }

  const totalQty = cartItems.reduce((sum, item) => sum + item.quantityMt, 0);
  const method = getPaymentMethodById(payment.methodId);

  return {
    id: createOrderId(),
    productName: buildBlindProductName(primary.productType, primary.name),
    grade: primary.grade ?? '',
    productCategory: mapProductCategory(primary.productType),
    quantityMt: totalQty,
    warehouse: shippingAddress.warehouseName,
    destination: `${shippingAddress.line2}, ${shippingAddress.state}`,
    eta: null,
    progress: 0,
    shipmentStatus: 'processing',
    insuranceCovered: false,
    isMasterShipment: false,
    documents: [],
    amount: payment.payableAmount,
    paymentMethod: method.title,
    paymentMethodId: payment.methodId,
    paymentStatus: 'pending',
    verificationStatus: 'none',
    procurement: null,
    paymentVerifiedAt: null,
    orderStatus: 'order_created',
    priceLockStatus: 'active',
    priceLockStartedAt: null,
    priceLockDurationSeconds: 0,
    validationTimeline: null,
    confirmationStatus: 'pending_petrotrade',
    supplierConfirmation: 'pending',
    inventoryReserved: false,
    poNumber: null,
    poGenerated: false,
    procurementCompleted: false,
    dispatchStatus: null,
    documentsReady: false,
    workflowTimeline: null,
    dispatchReadiness: null,
    transitWindow: null,
    trackingTimeline: null,
    dispatchTrackingTimeline: null,
    trackingAvailable: false,
    dispatchProgress: 0,
    dispatchStartedAt: null,
    shipmentDetails: null,
    loadingStatus: 'pending',
    loadingSchedule: null,
    loadingProof: null,
    createdAt: new Date().toISOString(),
  };
};
