import { memo, useCallback, useState } from 'react';

import { Linking, Pressable, ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppHeader,
  InputField,
  PrimaryButton,
  ScreenWrapper,
  SecondaryButton,
  Typography,
} from '@/components';
import { EmptyState } from '@/components/market';
import { gradeRequestKeys, useGradeRequest } from '@/hooks/use-grade-requests';
import { ROUTES } from '@/navigation/routes';
import {
  cancelGradeRequest,
  fetchGradeRequestDocumentUrl,
  respondToGradeRequest,
  toGradeRequestError,
} from '@/services/grade-requests';
import { dayjs } from '@/utils/date';

import { GradeRequestStatusPill } from './GradeRequestStatusPill';

const firstParam = (value?: string | string[]): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export const GradeRequestDetailScreen = memo(function GradeRequestDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = firstParam(params.id) ?? null;
  const query = useGradeRequest(id);

  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: gradeRequestKeys.all });
  }, [queryClient]);

  const act = useCallback(
    async (fn: () => Promise<unknown>) => {
      setBusy(true);
      setActionError(null);
      try {
        await fn();
        setReply('');
        setConfirmCancel(false);
        await refresh();
      } catch (error) {
        setActionError(toGradeRequestError(error, 'Something went wrong.').message);
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const openDocument = useCallback(
    async (documentId: string) => {
      if (!id) return;
      try {
        const url = await fetchGradeRequestDocumentUrl(id, documentId);
        if (url) await Linking.openURL(url);
        else setActionError('This file cannot be opened right now.');
      } catch (error) {
        setActionError(toGradeRequestError(error, 'Unable to open the file.').message);
      }
    },
    [id],
  );

  const request = query.data;

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <AppHeader
        variant="back"
        title={request?.referenceNumber ?? 'Grade request'}
        fallbackHref={ROUTES.CUSTOMER.GRADE_REQUESTS as Href}
      />

      {query.isPending ? (
        <Typography variant="subheadingLeft" className="px-lg pt-xl">
          Loading request…
        </Typography>
      ) : query.isError || !request ? (
        <EmptyState
          title={
            toGradeRequestError(query.error, '').status === 404
              ? 'Request not found'
              : 'Unable to load this request'
          }
          description={toGradeRequestError(query.error, 'Please try again.').message}
          actionLabel="Retry"
          onActionPress={() => void query.refetch()}
        />
      ) : (
        <ScrollView
          className="flex-1 px-lg"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
            <View className="flex-row items-start justify-between">
              <Typography variant="headingLeft" className="mr-sm flex-1 text-[18px]">
                {request.gradeName}
              </Typography>
              <GradeRequestStatusPill status={request.status} label={request.statusLabel} />
            </View>
            <Typography variant="subheadingLeft" className="mt-sm">
              {request.statusDescription}
            </Typography>
            {request.adminMessage ? (
              <View className="mt-md rounded-lg bg-brand-background p-md">
                <Typography variant="fieldLabel" className="text-brand-muted">
                  Message from PolyStoreX
                </Typography>
                <Typography variant="roleDescription" className="mt-xs text-brand-heading">
                  {request.adminMessage}
                </Typography>
              </View>
            ) : null}
            {request.closureReason &&
            (request.status === 'REJECTED' || request.status === 'CLOSED') ? (
              <Typography variant="roleDescription" className="mt-md">
                Reason: {request.closureReason}
              </Typography>
            ) : null}
            {request.resolvedGrade ? (
              <PrimaryButton
                label={`View grade ${request.resolvedGrade.name}`}
                className="mt-md"
                onPress={() =>
                  router.push({
                    pathname: ROUTES.CUSTOMER.GRADE_DETAILS,
                    params: { id: request.resolvedGrade?.id },
                  } as unknown as Href)
                }
              />
            ) : null}
          </View>

          {request.awaitingCustomerResponse ? (
            <View className="mt-lg rounded-2xl border border-brand-error bg-brand-white p-lg">
              <Typography variant="roleTitle" className="text-[14px]">
                Your response is needed
              </Typography>
              <InputField
                containerClassName="mt-md"
                label="Your response"
                value={reply}
                onChangeText={setReply}
                maxLength={2000}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <PrimaryButton
                label="Send response"
                className="mt-md"
                loading={busy}
                disabled={reply.trim().length < 2}
                onPress={() => void act(() => respondToGradeRequest(request.id, reply.trim()))}
              />
            </View>
          ) : null}

          {actionError ? (
            <View
              accessibilityRole="alert"
              className="mt-md rounded-xl border border-brand-error bg-brand-white p-md"
            >
              <Typography variant="error">{actionError}</Typography>
            </View>
          ) : null}

          <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
            <Typography variant="fieldLabel" className="mb-sm text-brand-muted">
              Request details
            </Typography>
            {(
              [
                ['Material', request.materialCategory],
                ['Manufacturer', request.manufacturer],
                ['Grade group', request.gradeGroup],
                ['Application', request.application],
                ['Quantity', `${request.quantity} ${request.unit}`],
                [
                  'Delivery',
                  [request.deliveryLocation, request.deliveryPincode].filter(Boolean).join(' – '),
                ],
                ['Required by', request.requiredByDate],
                ['Packaging', request.preferredPackaging],
                ['Contact', `${request.contactName} · ${request.contactPhone}`],
              ] as [string, string | null][]
            )
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <View key={label} className="mb-sm">
                  <Typography variant="roleDescription" className="text-[11px] text-brand-muted">
                    {label}
                  </Typography>
                  <Typography variant="roleDescription" className="text-brand-heading">
                    {value}
                  </Typography>
                </View>
              ))}
            {request.technicalSpecs ? (
              <Typography variant="roleDescription" className="mt-xs">
                {request.technicalSpecs}
              </Typography>
            ) : null}
          </View>

          {request.documents.length ? (
            <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
              <Typography variant="fieldLabel" className="mb-sm text-brand-muted">
                Attachments
              </Typography>
              {request.documents.map((doc) => (
                <Pressable
                  key={doc.id}
                  onPress={() => void openDocument(doc.id)}
                  accessibilityRole="button"
                  className="py-xs"
                >
                  <Typography variant="link">{doc.fileName}</Typography>
                </Pressable>
              ))}
            </View>
          ) : null}

          <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
            <Typography variant="fieldLabel" className="mb-md text-brand-muted">
              Progress
            </Typography>
            {[...request.timeline].reverse().map((event) => (
              <View key={event.id} className="mb-md border-l border-brand-border pl-md">
                <Typography variant="roleTitle" className="text-[13px]">
                  {event.toStatusLabel ?? event.type.replace(/_/g, ' ').toLowerCase()}
                </Typography>
                {event.message ? (
                  <Typography variant="roleDescription" className="mt-xs">
                    {event.message}
                  </Typography>
                ) : null}
                <Typography
                  variant="roleDescription"
                  className="mt-xs text-[11px] text-brand-muted"
                >
                  {event.actor === 'YOU' ? 'You' : 'PolyStoreX'} ·{' '}
                  {dayjs(event.createdAt).format('DD MMM YYYY, h:mm A')}
                </Typography>
              </View>
            ))}
          </View>

          {request.isOpen ? (
            confirmCancel ? (
              <View className="mt-lg rounded-xl border border-brand-error bg-brand-white p-lg">
                <Typography variant="roleTitle" className="text-[14px]">
                  Cancel this request?
                </Typography>
                <View className="mt-md flex-row gap-md">
                  <View className="flex-1">
                    <SecondaryButton label="Keep" onPress={() => setConfirmCancel(false)} />
                  </View>
                  <View className="flex-1">
                    <PrimaryButton
                      label="Yes, cancel"
                      loading={busy}
                      onPress={() => void act(() => cancelGradeRequest(request.id))}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setConfirmCancel(true)}
                accessibilityRole="button"
                className="mt-lg items-center py-md"
              >
                <Typography variant="error">Cancel request</Typography>
              </Pressable>
            )
          ) : null}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
});
