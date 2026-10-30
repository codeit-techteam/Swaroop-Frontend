import { memo } from 'react';

import { ActivityIndicator, Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import type { PaymentMethodId } from '@/types/payment';
import type { CreditAccessView, CreditLoadState } from '@/types/payment-eligibility';
import { shouldRenderCreditInfo } from '@/types/payment-eligibility';
import type { ProductPaymentOption } from '@/types/product';
import { cn } from '@/utils/cn';

type PaymentOptionsCardProps = {
  options: ProductPaymentOption[];
  selectedId: PaymentMethodId;
  onSelect: (id: PaymentMethodId) => void;
  creditAccess?: CreditAccessView | null;
  creditStatus?: CreditLoadState;
  onRetryCredit?: () => void;
  onCreditCta?: (type: NonNullable<CreditAccessView['cta']>['type']) => void;
  className?: string;
};

function formatLimit(value: string | null | undefined, currency = 'INR'): string | null {
  if (value == null || value === '') return null;
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return `${currency} ${Math.round(amount).toLocaleString('en-IN')}`;
}

function isCreditOption(option: ProductPaymentOption) {
  return option.id.startsWith('credit');
}

export const PaymentOptionsCard = memo(function PaymentOptionsCard({
  options,
  selectedId,
  onSelect,
  creditAccess,
  creditStatus = 'idle',
  onRetryCredit,
  onCreditCta,
  className,
}: PaymentOptionsCardProps) {
  const visible = options.filter((option) => option.title?.trim());
  const selectable = visible.filter((option) => option.eligible);
  const selected = selectable.find((option) => option.id === selectedId) ?? selectable[0] ?? null;
  const hasLockedCredit = visible.some(
    (option) => isCreditOption(option) && !option.eligible,
  );
  const showCreditCard =
    creditStatus !== 'loading' &&
    creditStatus !== 'error' &&
    shouldRenderCreditInfo(creditAccess) &&
    !creditAccess?.eligible &&
    !(hasLockedCredit && creditAccess?.state === 'NOT_APPLIED');
  const submittedAt = creditAccess?.application?.submittedAt;
  const submittedLabel = submittedAt
    ? new Date(submittedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;
  const account = creditAccess?.account;
  const ctaType = creditAccess?.cta?.type ?? 'REQUEST_CREDIT';
  const ctaLabel = creditAccess?.cta?.label ?? 'Request Credit';

  return (
    <View
      className={cn(
        'mx-lg rounded-xl border border-brand-border bg-brand-white p-lg shadow-sm',
        className,
      )}
    >
      <Typography variant="fieldLabel" className="text-[10px] tracking-[0.8px] text-brand-muted">
        Payment Method
      </Typography>
      <View className="mt-md" style={{ gap: 8 }}>
        {visible.map((option) => {
          const locked = !option.eligible;
          const isSelected = !locked && option.id === selectedId;
          const saveLabel =
            option.discountRate && option.discountRate > 0
              ? `Save ${(option.discountRate * 100).toFixed((option.discountRate * 100) % 1 === 0 ? 0 : 2)}%`
              : option.surchargeLabel;
          const unlockLabel =
            option.benefitLabel?.trim() || (isCreditOption(option) ? ctaLabel : null);

          if (locked) {
            return (
              <View
                key={option.id}
                className="rounded-lg border border-dashed border-brand-border bg-brand-surface px-md py-md"
                accessibilityRole="text"
                accessibilityLabel={`${option.title}. Available for credit. ${option.description}`}
              >
                <View className="flex-row items-start">
                  <View className="mt-0.5 h-4 w-4 items-center justify-center rounded-full border border-brand-border bg-brand-white" />
                  <View className="ml-sm min-w-0 flex-1">
                    <View className="flex-row flex-wrap items-center justify-between gap-sm">
                      <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                        {option.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        className="rounded-md bg-amber-50 px-1.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-amber-800"
                      >
                        Available for credit
                      </Typography>
                    </View>
                    <Typography
                      variant="caption"
                      className="mt-0.5 font-sans text-[12px] normal-case leading-[16px] tracking-normal text-brand-muted"
                    >
                      {option.description}
                    </Typography>
                    {option.dueLabel ? (
                      <Typography
                        variant="caption"
                        className="mt-0.5 font-sans text-[11px] normal-case tracking-normal text-brand-muted"
                      >
                        {option.dueLabel}
                      </Typography>
                    ) : null}
                    {onCreditCta && isCreditOption(option) ? (
                      <Pressable
                        onPress={() => onCreditCta(ctaType)}
                        accessibilityRole="button"
                        accessibilityLabel={unlockLabel ?? ctaLabel}
                        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                        className="mt-md h-9 items-center justify-center rounded-lg border border-brand-heading"
                      >
                        <Typography variant="button" className="text-[12px] text-brand-heading">
                          {unlockLabel}
                        </Typography>
                      </Pressable>
                    ) : unlockLabel ? (
                      <Typography
                        variant="caption"
                        className="mt-xs font-sans text-[11px] font-medium normal-case tracking-normal text-amber-800"
                      >
                        {unlockLabel}
                      </Typography>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          }

          return (
            <Pressable
              key={option.id}
              onPress={() => {
                if (option.id !== selectedId) onSelect(option.id);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${option.title}. ${option.description}`}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              className={cn(
                'rounded-lg border px-md py-md',
                isSelected
                  ? 'border-brand-primary bg-brand-primary-tint'
                  : 'border-brand-border bg-brand-surface',
              )}
            >
              <View className="flex-row items-start">
                <View
                  className={cn(
                    'mt-0.5 h-4 w-4 items-center justify-center rounded-full border',
                    isSelected
                      ? 'border-brand-heading bg-brand-heading'
                      : 'border-brand-border bg-brand-white',
                  )}
                >
                  {isSelected ? <View className="h-1.5 w-1.5 rounded-full bg-brand-white" /> : null}
                </View>
                <View className="ml-sm min-w-0 flex-1">
                  <View className="flex-row items-center justify-between">
                    <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                      {option.title}
                    </Typography>
                    {saveLabel ? (
                      <Typography variant="success" className="text-[11px]">
                        {saveLabel}
                      </Typography>
                    ) : null}
                  </View>
                  <Typography
                    variant="caption"
                    className="mt-0.5 font-sans text-[12px] normal-case leading-[16px] tracking-normal text-brand-muted"
                  >
                    {option.description}
                  </Typography>
                  {option.dueLabel ? (
                    <Typography
                      variant="caption"
                      className="mt-0.5 font-sans text-[11px] normal-case tracking-normal text-brand-muted"
                    >
                      {option.dueLabel}
                    </Typography>
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {creditStatus === 'loading' ? (
        <View className="mt-md flex-row items-center rounded-lg border border-brand-border bg-brand-surface px-md py-md">
          <ActivityIndicator size="small" />
          <Typography
            variant="caption"
            className="ml-sm font-sans text-[12px] normal-case tracking-normal text-brand-muted"
          >
            Checking credit eligibility…
          </Typography>
        </View>
      ) : null}

      {creditStatus === 'error' ? (
        <View className="mt-md rounded-lg border border-brand-border bg-brand-surface px-md py-md">
          <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
            {creditAccess?.title || 'Unable to load credit options'}
          </Typography>
          <Typography
            variant="caption"
            className="mt-xs font-sans text-[12px] normal-case leading-[16px] tracking-normal text-brand-muted"
          >
            {creditAccess?.message ||
              'We could not verify business credit for this order. Other payment methods remain available.'}
          </Typography>
          {onRetryCredit ? (
            <Pressable
              onPress={onRetryCredit}
              accessibilityRole="button"
              accessibilityLabel="Retry credit eligibility"
              className="mt-md h-10 items-center justify-center rounded-lg border border-brand-heading"
            >
              <Typography variant="button" className="text-[13px] text-brand-heading">
                Retry
              </Typography>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {showCreditCard && creditAccess ? (
        <View className="mt-md rounded-lg border border-brand-border bg-brand-surface px-md py-md">
          <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
            {creditAccess.title}
          </Typography>
          <Typography
            variant="caption"
            className="mt-xs font-sans text-[12px] normal-case leading-[16px] tracking-normal text-brand-muted"
          >
            {creditAccess.message}
          </Typography>
          {creditAccess.state === 'APPLICATION_PENDING' && submittedLabel ? (
            <Typography
              variant="caption"
              className="mt-xs font-sans text-[11px] normal-case tracking-normal text-brand-muted"
            >
              Submitted {submittedLabel}
              {creditAccess.application?.displayStatus
                ? ` · ${creditAccess.application.displayStatus}`
                : ''}
            </Typography>
          ) : null}
          {creditAccess.state === 'LIMIT_EXCEEDED' && account ? (
            <Typography
              variant="caption"
              className="mt-xs font-sans text-[11px] normal-case tracking-normal text-brand-muted"
            >
              Approved {formatLimit(account.approvedLimit, account.currency) ?? '—'} · Used{' '}
              {formatLimit(account.utilizedAmount, account.currency) ?? '—'} · Available{' '}
              {formatLimit(account.availableLimit, account.currency) ?? '—'}
            </Typography>
          ) : null}
          {creditAccess.cta && onCreditCta ? (
            <Pressable
              onPress={() => onCreditCta(creditAccess.cta!.type)}
              accessibilityRole="button"
              accessibilityLabel={creditAccess.cta.label}
              className="mt-md h-10 items-center justify-center rounded-lg bg-brand-heading"
            >
              <Typography variant="button" className="text-[13px] text-brand-white">
                {creditAccess.cta.label}
              </Typography>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {creditAccess?.state === 'APPROVED' && creditAccess.eligible && account ? (
        <View className="mt-md rounded-lg border border-brand-border bg-brand-surface px-md py-sm">
          <Typography
            variant="caption"
            className="font-sans text-[11px] normal-case tracking-normal text-brand-muted"
          >
            Approved {formatLimit(account.approvedLimit, account.currency) ?? '—'} · Used{' '}
            {formatLimit(account.utilizedAmount, account.currency) ?? '—'} · Available{' '}
            {formatLimit(account.availableLimit, account.currency) ?? '—'}
          </Typography>
          {selected?.id.startsWith('credit') ? (
            <Typography
              variant="caption"
              className="mt-0.5 font-sans text-[11px] normal-case tracking-normal text-brand-muted"
            >
              Selected tenure {selected.title}
            </Typography>
          ) : null}
        </View>
      ) : null}

      {selected ? (
        <View className="mt-md rounded-lg border border-brand-success-light bg-brand-success-light/70 px-md py-md">
          <Typography
            variant="fieldLabel"
            className="text-[10px] tracking-[0.8px] text-brand-success"
          >
            Selected Payment
          </Typography>
          <Typography variant="roleTitle" className="mt-xs text-[14px] text-brand-heading">
            {selected.title}
          </Typography>
          {selected.benefitLabel ? (
            <Typography variant="success" className="mt-xs text-[12px]">
              {selected.benefitLabel}
            </Typography>
          ) : selected.dueLabel ? (
            <Typography
              variant="caption"
              className="mt-xs font-sans text-[12px] normal-case tracking-normal text-brand-muted"
            >
              {selected.dueLabel}
            </Typography>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});
