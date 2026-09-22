import { PRODUCT_GST_RATE } from '@/constants/productDetails';
import { toUiPaymentOption } from '@/services/checkout';
import type { CheckoutQuote } from '@/types/checkout-quote';
import type { PaymentMethodId } from '@/types/payment';

export const DEFAULT_FREIGHT_PER_MT = 1250;
export const DEFAULT_ADVANCE_DISCOUNT_RATE = 0.05;

export type ProductQuoteEstimate = {
  unitPrice: number;
  quantity: number;
  materialSubtotal: number;
  discount: number;
  freight: number;
  gst: number;
  gstRate: number;
  gstLabel: string;
  grandTotal: number;
};

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function estimateProductQuote(input: {
  unitPrice: number;
  quantity: number;
  discountRate?: number;
  freightPerMt?: number;
  gstRate?: number;
}): ProductQuoteEstimate | null {
  if (!(input.unitPrice > 0) || !(input.quantity > 0)) {
    return null;
  }

  const discountRate = Math.max(0, input.discountRate ?? 0);
  const freightPerMt = input.freightPerMt ?? DEFAULT_FREIGHT_PER_MT;
  const gstRate = input.gstRate ?? PRODUCT_GST_RATE;
  const materialSubtotal = round2(input.unitPrice * input.quantity);
  const discount = round2(materialSubtotal * discountRate);
  const freight = round2(freightPerMt * input.quantity);
  const taxable = round2(materialSubtotal - discount + freight);
  const gst = round2(taxable * gstRate);
  const gstPercent = gstRate * 100;

  return {
    unitPrice: input.unitPrice,
    quantity: input.quantity,
    materialSubtotal,
    discount,
    freight,
    gst,
    gstRate: gstPercent,
    gstLabel: `Estimated GST (${gstPercent % 1 === 0 ? gstPercent.toFixed(0) : gstPercent.toFixed(2)}%)`,
    grandTotal: round2(taxable + gst),
  };
}

export function buyingSummaryFromQuote(quote: CheckoutQuote): ProductQuoteEstimate {
  const gstRate = Number(quote.taxRate);

  return {
    unitPrice: Number(quote.unitPrice),
    quantity: Number(quote.quantity),
    materialSubtotal: Number(quote.baseAmount),
    discount: Number(quote.discountAmount),
    freight: Number(quote.freightAmount),
    gst: Number(quote.taxAmount),
    gstRate,
    gstLabel: `Estimated GST (${quote.taxRate}%)`,
    grandTotal: Number(quote.totalAmount),
  };
}

export function quoteMatchesSelection(
  quote: CheckoutQuote | null | undefined,
  quantity: number,
  paymentId: PaymentMethodId,
): quote is CheckoutQuote {
  if (!quote) {
    return false;
  }

  return (
    Number(quote.quantity) === quantity && toUiPaymentOption(quote.paymentOption) === paymentId
  );
}
