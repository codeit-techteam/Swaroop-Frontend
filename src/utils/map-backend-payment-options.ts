import type { CheckoutPaymentOption } from '@/types/checkout-quote';
import type { ProductPaymentOption } from '@/types/product';

export function mapBackendPaymentOptions(options: CheckoutPaymentOption[]): ProductPaymentOption[] {
  return options
    .filter((option) => Boolean(option.title?.trim()))
    .map((option) => {
      const id =
        option.paymentOption === 'ON_LOADING'
          ? 'on_loading'
          : option.paymentOption === 'ON_DELIVERY'
            ? 'on_delivery'
            : option.paymentOption === 'CREDIT_30' || option.paymentOption === 'CREDIT'
              ? 'credit_30'
              : option.paymentOption === 'CREDIT_15'
                ? 'credit_15'
                : 'advance';
      return {
        id,
        title: option.title,
        description: option.description,
        dueLabel: option.dueLabel ?? undefined,
        benefitLabel: option.benefitLabel ?? undefined,
        discountRate: option.discountBps ? option.discountBps / 10000 : undefined,
        // Locked credit previews stay visible so buyers can Request Credit.
        eligible: option.eligible !== false,
      };
    });
}
