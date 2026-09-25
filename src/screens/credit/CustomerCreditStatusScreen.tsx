import { memo, useCallback, useRef, useState } from 'react';

import { RefreshControl, ScrollView, TextInput, View } from 'react-native';

import { type Href, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppHeader,
  DocumentUploadCard,
  PrimaryButton,
  ScreenWrapper,
  SecondaryButton,
  StatusBadge,
  Typography,
} from '@/components';
import { CreditTimelineList } from '@/components/credit';
import { getApiErrorMessage } from '@/api/client';
import { useCreditDocuments } from '@/hooks/use-credit-documents';
import { ROUTES } from '@/navigation/routes';
import {
  fetchCreditApplication,
  fetchLatestCreditApplication,
  resubmitCreditDocuments,
} from '@/services/customer-credit';
import type { CreditApplication } from '@/types/customer-credit';
import {
  creditStatusLabel,
  creditStatusVariant,
  isTerminalCreditStatus,
} from '@/types/customer-credit';
import { brandColors } from '@/theme/colors';
import { formatCurrency } from '@/utils/currency';

/** Soft polling cadence while the application is still moving. */
const POLL_INTERVAL_MS = 45_000;

const toAmount = (value: string | number | null | undefined): string =>
  formatCurrency(Number(value ?? 0), { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const CustomerCreditStatusScreen = memo(function CustomerCreditStatusScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();

  const [application, setApplication] = useState<CreditApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const applicationIdRef = useRef<string | undefined>(params.id);
  applicationIdRef.current = params.id ?? application?.id;

  const load = useCallback(async () => {
    try {
      const id = applicationIdRef.current;
      const next = id ? await fetchCreditApplication(id) : await fetchLatestCreditApplication();
      setApplication(next);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const status = application?.status ?? null;
  const isTerminal = isTerminalCreditStatus(status);
  const needsDocuments = status === 'DOCUMENTS_REQUIRED';

  useFocusEffect(
    useCallback(() => {
      void load();

      // Soft-poll while focused and the application is still in flight.
      if (isTerminal) return undefined;
      const timer = setInterval(() => {
        void load();
      }, POLL_INTERVAL_MS);
      return () => clearInterval(timer);
    }, [isTerminal, load]),
  );

  const { documents, pickDocument, isUploading, requiredReady } = useCreditDocuments({
    application: needsDocuments ? application : null,
    onUploaded: load,
  });

  const handleResubmit = useCallback(async () => {
    if (!application) return;
    setIsResubmitting(true);
    setError(null);
    try {
      await resubmitCreditDocuments(application.id, note);
      setNote('');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsResubmitting(false);
    }
  }, [application, load, note]);

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <AppHeader variant="back" title="Credit Application" onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            Loading application…
          </Typography>
        ) : null}

        {error ? (
          <View className="mt-lg rounded-2xl border border-brand-error bg-brand-white px-lg py-md">
            <Typography variant="error">{error}</Typography>
          </View>
        ) : null}

        {!isLoading && !application ? (
          <View className="mt-lg items-center rounded-2xl border border-dashed border-brand-border bg-brand-white px-lg py-xl">
            <Typography variant="roleTitle">No credit application yet</Typography>
            <Typography variant="subheading" className="mt-sm text-brand-body">
              Start a request to unlock trading credit at checkout.
            </Typography>
            <PrimaryButton
              className="mt-lg"
              label="Request Credit"
              onPress={() => router.replace(ROUTES.CUSTOMER.CREDIT_REQUEST as Href)}
            />
          </View>
        ) : null}

        {application ? (
          <>
            <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg shadow-sm">
              <View className="flex-row items-start justify-between gap-sm">
                <View className="flex-1">
                  <Typography variant="fieldLabel" className="text-brand-muted">
                    Application
                  </Typography>
                  <Typography variant="roleTitle" className="mt-xs">
                    {application.applicationNumber}
                  </Typography>
                </View>
                <StatusBadge
                  label={creditStatusLabel(application.status)}
                  variant={creditStatusVariant(application.status)}
                />
              </View>

              <Typography variant="subheadingLeft" className="mt-md text-brand-body">
                {application.nextStep}
              </Typography>

              {application.customerMessage ? (
                <View className="mt-md rounded-xl bg-brand-surface px-md py-md">
                  <Typography variant="subheadingLeft" className="text-brand-body">
                    {application.customerMessage}
                  </Typography>
                </View>
              ) : null}

              <View className="mt-lg gap-md border-t border-brand-border pt-lg">
                <View className="flex-row justify-between gap-md">
                  <Typography variant="subheadingLeft" className="text-brand-muted">
                    Requested Limit
                  </Typography>
                  <Typography variant="roleTitle" className="text-[14px]">
                    {toAmount(application.requestedLimit)}
                  </Typography>
                </View>
                {application.approvedLimit ? (
                  <View className="flex-row justify-between gap-md">
                    <Typography variant="subheadingLeft" className="text-brand-muted">
                      Approved Limit
                    </Typography>
                    <Typography variant="roleTitle" className="text-[14px] text-brand-primary">
                      {toAmount(application.approvedLimit)}
                    </Typography>
                  </View>
                ) : null}
                <View className="flex-row justify-between gap-md">
                  <Typography variant="subheadingLeft" className="text-brand-muted">
                    Payment Terms
                  </Typography>
                  <Typography variant="roleTitle" className="text-[14px]">
                    {application.approvedTenureDays ?? application.requestedTenureDays
                      ? `Net-${application.approvedTenureDays ?? application.requestedTenureDays}`
                      : '—'}
                  </Typography>
                </View>
                <View className="flex-row justify-between gap-md">
                  <Typography variant="subheadingLeft" className="text-brand-muted">
                    Submitted
                  </Typography>
                  <Typography variant="roleTitle" className="text-[14px]">
                    {formatDate(application.submittedAt)}
                  </Typography>
                </View>
              </View>
            </View>

            {needsDocuments ? (
              <View className="mt-lg">
                <Typography variant="headingLeft" className="text-[18px] text-brand-primary">
                  Additional Documents
                </Typography>
                <Typography variant="subheadingLeft" className="mt-xs">
                  Upload or replace the documents requested by the credit team, then resubmit.
                </Typography>

                <View className="mt-lg gap-md">
                  {documents.map((document) => (
                    <DocumentUploadCard
                      key={document.id}
                      document={document}
                      onUpload={(id) => void pickDocument(id)}
                    />
                  ))}
                </View>

                <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white px-lg py-md">
                  <Typography variant="fieldLabel" className="mb-xs text-brand-muted">
                    Note for reviewer (optional)
                  </Typography>
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="Anything the credit team should know"
                    placeholderTextColor={brandColors.footer}
                    multiline
                    textAlignVertical="top"
                    className="min-h-[72px] font-sans text-[15px] text-brand-heading"
                  />
                </View>

                <PrimaryButton
                  className="mt-lg"
                  label="Resubmit Documents"
                  loading={isResubmitting}
                  disabled={isUploading || isResubmitting || !requiredReady}
                  onPress={() => void handleResubmit()}
                />
              </View>
            ) : null}

            {application.documents.length > 0 && !needsDocuments ? (
              <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg shadow-sm">
                <Typography variant="fieldLabel" className="text-brand-muted">
                  Submitted Documents
                </Typography>
                <View className="mt-md gap-sm">
                  {application.documents.map((doc) => (
                    <View key={doc.id} className="flex-row items-center justify-between gap-sm">
                      <Typography
                        variant="subheadingLeft"
                        className="flex-1 text-brand-body"
                        numberOfLines={1}
                      >
                        {doc.label}
                      </Typography>
                      <StatusBadge
                        label={creditStatusLabel(doc.status)}
                        variant={doc.status === 'REJECTED' ? 'muted' : 'uploaded'}
                      />
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <CreditTimelineList className="mt-lg" events={application.timeline ?? []} />

            <SecondaryButton
              className="mt-xl"
              variant="outline"
              label="Back to Trading Credit"
              onPress={() => router.replace(ROUTES.CUSTOMER.CREDIT_FACILITY as Href)}
            />
          </>
        ) : null}
      </ScrollView>
    </ScreenWrapper>
  );
});
