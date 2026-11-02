import { memo, useCallback, useState } from 'react';

import { Linking, Pressable, ScrollView, View } from 'react-native';

import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {
  InputField,
  PrimaryButton,
  ScreenWrapper,
  SecondaryButton,
  Typography,
} from '@/components';
import { gradeRequestApiFor, gradeRequestKeys, useGradeRequest } from '@/hooks/use-grade-requests';
import { type GradeRequestRole, toGradeRequestError } from '@/services/grade-requests';
import { isAwaitingRequesterResponse } from '@/types/grade-request';
import { dayjs } from '@/utils/date';

import { GradeRequestHeader, GradeRequestStateCard } from './GradeRequestParts';
import { GradeRequestStatusPill } from './GradeRequestStatusPill';
import { GRADE_REQUEST_ROLE_CONFIG, firstParam } from './role-config';

type Props = { role?: GradeRequestRole };

export const GradeRequestDetailScreen = memo(function GradeRequestDetailScreen({
  role = 'customer',
}: Props) {
  const router = useRouter();
  const config = GRADE_REQUEST_ROLE_CONFIG[role];
  const api = gradeRequestApiFor(role);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = firstParam(params.id) ?? null;
  const query = useGradeRequest(id, role);

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
        const message = toGradeRequestError(error, 'Something went wrong.').message;
        setActionError(message);
        Toast.show({ type: 'error', text1: 'Action failed', text2: message });
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
        const url = await api.fetchDocumentUrl(id, documentId);
        if (url) await Linking.openURL(url);
        else setActionError('This file cannot be opened right now.');
      } catch (error) {
        setActionError(toGradeRequestError(error, 'Unable to open the file.').message);
      }
    },
    [api, id],
  );

  const request = query.data;

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <GradeRequestHeader
        role={role}
        title={request?.referenceNumber ?? (role === 'seller' ? 'Grade Request' : 'Grade request')}
        fallbackHref={config.listRoute as Href}
      />

      {query.isPending ? (
        <Typography variant="subheadingLeft" className="px-lg pt-xl">
          Loading request…
        </Typography>
      ) : query.isError || !request ? (
        <GradeRequestStateCard
          role={role}
          kind="error"
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
              <>
                {config.resolvedHint ? (
                  <Typography variant="roleDescription" className="mt-md text-brand-body">
                    {config.resolvedHint}
                  </Typography>
                ) : null}
                <PrimaryButton
                  label={config.resolvedActionLabel(request.resolvedGrade.name)}
                  className="mt-md"
                  onPress={() => {
                    const grade = request.resolvedGrade;
                    if (!grade) return;
                    if (config.gradeDetailsRoute) {
                      router.push({
                        pathname: config.gradeDetailsRoute,
                        params: { id: grade.id },
                      } as unknown as Href);
                    } else {
                      // Seller: continue into Add Product with the catalogue grade preselected.
                      router.push({
                        pathname: config.browseRoute,
                        params: { catalogId: grade.id },
                      } as unknown as Href);
                    }
                  }}
                />
              </>
            ) : null}
          </View>

          {isAwaitingRequesterResponse(request) ? (
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
                onPress={() => void act(() => api.respond(request.id, reply.trim()))}
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
                      onPress={() => void act(() => api.cancel(request.id))}
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
