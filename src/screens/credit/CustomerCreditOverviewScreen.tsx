import { memo, useCallback, useState } from 'react';

import { RefreshControl, ScrollView, View } from 'react-native';

import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader, PrimaryButton, ScreenWrapper, SecondaryButton, Typography } from '@/components';
import { CreditSummaryCard } from '@/components/credit';
import { getApiErrorMessage } from '@/api/client';
import { ROUTES } from '@/navigation/routes';
import { fetchCreditSummary, fetchLatestCreditApplication } from '@/services/customer-credit';
import type { CreditApplication, CreditSummary } from '@/types/customer-credit';
import {
  canStartNewCreditApplication,
  creditStatusLabel,
  isTerminalCreditStatus,
} from '@/types/customer-credit';
import { formatCurrency } from '@/utils/currency';

const BENEFITS = [
  'Buy now and pay on Net-15 or Net-30 terms.',
  'Limits are reviewed by PetroTrade Credit Management.',
  'Approved limits unlock credit options at checkout.',
];

export const CustomerCreditOverviewScreen = memo(function CustomerCreditOverviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [summary, setSummary] = useState<CreditSummary | null>(null);
  const [application, setApplication] = useState<CreditApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [nextSummary, nextApplication] = await Promise.all([
        fetchCreditSummary(),
        fetchLatestCreditApplication(),
      ]);
      setSummary(nextSummary);
      setApplication(nextApplication);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const displayStatus = summary?.status ?? 'NOT_APPLIED';
  const applicationStatus = application?.status ?? null;
  const isDraft = applicationStatus === 'DRAFT';
  const hasOpenApplication = Boolean(
    applicationStatus && !isDraft && !isTerminalCreditStatus(applicationStatus),
  );
  const canApply =
    isDraft || !applicationStatus || canStartNewCreditApplication(applicationStatus);

  const handleRequestCredit = useCallback(() => {
    router.push(ROUTES.CUSTOMER.CREDIT_REQUEST as Href);
  }, [router]);

  const handleViewApplication = useCallback(() => {
    if (!application) return;
    router.push({
      pathname: ROUTES.CUSTOMER.CREDIT_APPLICATION_STATUS,
      params: { id: application.id },
    } as unknown as Href);
  }, [application, router]);

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <AppHeader variant="back" title="Trading Credit" onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              void load();
            }}
          />
        }
      >
        {isLoading ? (
          <Typography variant="subheadingLeft" className="mt-lg text-brand-body">
            Loading your credit facility…
          </Typography>
        ) : null}

        {error ? (
          <View className="mt-lg rounded-2xl border border-brand-error bg-brand-white px-lg py-md">
            <Typography variant="error">{error}</Typography>
          </View>
        ) : null}

        {summary ? (
          <CreditSummaryCard
            className="mt-lg"
            status={displayStatus}
            approvedLimit={summary.account?.approvedLimit ?? '0'}
            availableLimit={summary.account?.availableLimit ?? '0'}
            utilizedAmount={summary.account?.utilizedAmount ?? '0'}
            outstandingAmount={summary.account?.outstandingAmount ?? '0'}
            account={summary.account}
          />
        ) : null}

        {application && !isDraft ? (
          <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg shadow-sm">
            <Typography variant="fieldLabel" className="text-brand-muted">
              Latest Application
            </Typography>
            <Typography variant="roleTitle" className="mt-xs">
              {application.applicationNumber}
            </Typography>
            <Typography variant="subheadingLeft" className="mt-xs text-brand-body">
              {creditStatusLabel(application.status)} ·{' '}
              {formatCurrency(Number(application.requestedLimit), {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}{' '}
              requested
            </Typography>
            <Typography variant="subheadingLeft" className="mt-sm text-brand-body">
              {application.nextStep}
            </Typography>
            <SecondaryButton
              className="mt-lg"
              variant="outline"
              label="View Application"
              onPress={handleViewApplication}
            />
          </View>
        ) : null}

        <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg shadow-sm">
          <Typography variant="fieldLabel" className="text-brand-muted">
            How it works
          </Typography>
          <View className="mt-md gap-sm">
            {BENEFITS.map((benefit) => (
              <View key={benefit} className="flex-row gap-sm">
                <Typography variant="subheadingLeft" className="text-brand-primary">
                  •
                </Typography>
                <Typography variant="subheadingLeft" className="flex-1 text-brand-body">
                  {benefit}
                </Typography>
              </View>
            ))}
          </View>
        </View>

        {!isLoading && canApply ? (
          <PrimaryButton
            className="mt-xl"
            label={isDraft ? 'Continue Application' : 'Request Credit'}
            onPress={handleRequestCredit}
          />
        ) : null}

        {!isLoading && hasOpenApplication ? (
          <Typography variant="legal" className="mt-xl text-brand-muted">
            You already have an application in progress. Only one credit application can be open
            at a time.
          </Typography>
        ) : null}
      </ScrollView>
    </ScreenWrapper>
  );
});
