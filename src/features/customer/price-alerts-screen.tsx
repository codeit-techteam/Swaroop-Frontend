import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';

import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader, PrimaryButton, SecondaryButton, Typography } from '@/components';
import { ROUTES } from '@/navigation/routes';
import { buildLoginHref } from '@/navigation/return-to';
import {
  createPriceAlert,
  deletePriceAlert,
  fetchPriceAlerts,
  updatePriceAlert,
  type PriceAlert,
} from '@/services/price-alerts';
import { selectIsLoggedIn, useAuthStore } from '@/store/auth-store';
import { brandColors } from '@/theme/colors';
import { formatEstimateMoney } from '@/services/marketplace-pricing';

export const CustomerPriceAlertsScreen = memo(function CustomerPriceAlertsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isLoggedIn = useAuthStore(selectIsLoggedIn);

  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gradeId, setGradeId] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [direction, setDirection] = useState<'BELOW' | 'ABOVE'>('BELOW');
  const [saving, setSaving] = useState(false);

  const evaluationNotice = useMemo(() => {
    const first = alerts.find((alert) => alert.evaluation);
    return first?.evaluation;
  }, [alerts]);

  const loadAlerts = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      setAlerts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await fetchPriceAlerts();
      setAlerts(items);
    } catch (cause) {
      setAlerts([]);
      setError(cause instanceof Error ? cause.message : 'Unable to load price alerts');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ROUTES.CUSTOMER.HOME as Href);
  }, [router]);

  const handleCreate = useCallback(async () => {
    if (!isLoggedIn) {
      router.push(buildLoginHref(ROUTES.CUSTOMER.PRICE_ALERTS));
      return;
    }
    const price = targetPrice.trim();
    const grade = gradeId.trim();
    if (!grade || !/^\d{1,14}(\.\d{1,4})?$/.test(price)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid alert',
        text2: 'Enter a grade ID and a numeric target price.',
      });
      return;
    }
    setSaving(true);
    try {
      const created = await createPriceAlert({
        gradeId: grade,
        targetPrice: price,
        direction,
        unit: 'MT',
        currency: 'INR',
      });
      setAlerts((prev) => [created, ...prev]);
      setTargetPrice('');
      Toast.show({
        type: 'success',
        text1: 'Price alert saved',
        text2: created.evaluation?.supported
          ? 'You will be notified when the condition is met.'
          : created.evaluation?.reason ??
            'Alert stored. Evaluation worker is not configured yet.',
      });
    } catch (cause) {
      Toast.show({
        type: 'error',
        text1: 'Unable to create alert',
        text2: cause instanceof Error ? cause.message : 'Please try again.',
      });
    } finally {
      setSaving(false);
    }
  }, [direction, gradeId, isLoggedIn, router, targetPrice]);

  const handleToggle = useCallback(async (alert: PriceAlert) => {
    try {
      const updated = await updatePriceAlert(alert.id, { enabled: !alert.enabled });
      setAlerts((prev) => prev.map((item) => (item.id === alert.id ? updated : item)));
    } catch (cause) {
      Toast.show({
        type: 'error',
        text1: 'Unable to update alert',
        text2: cause instanceof Error ? cause.message : 'Please try again.',
      });
    }
  }, []);

  const handleDelete = useCallback(async (alert: PriceAlert) => {
    try {
      await deletePriceAlert(alert.id);
      setAlerts((prev) => prev.filter((item) => item.id !== alert.id));
    } catch (cause) {
      Toast.show({
        type: 'error',
        text1: 'Unable to delete alert',
        text2: cause instanceof Error ? cause.message : 'Please try again.',
      });
    }
  }, []);

  return (
    <View className="flex-1 bg-brand-background" style={{ paddingBottom: insets.bottom }}>
      <AppHeader variant="back" title="Price Alerts" onBack={handleBack} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="rounded-xl border border-brand-border bg-brand-white p-lg">
          <Typography variant="roleTitle" className="text-[15px] text-brand-heading">
            Create alert
          </Typography>
          <Typography
            variant="caption"
            className="mt-xs font-sans text-[12px] normal-case text-brand-muted"
          >
            Stored against a grade. Alerts do not fire until the evaluation worker is enabled.
          </Typography>
          <Typography variant="fieldLabel" className="mt-md text-brand-muted">
            Grade ID
          </Typography>
          <TextInput
            value={gradeId}
            onChangeText={setGradeId}
            placeholder="UUID of the grade"
            placeholderTextColor={brandColors.muted}
            autoCapitalize="none"
            className="mt-xs rounded-lg border border-brand-border bg-brand-surface px-md py-md font-sans text-[14px] text-brand-heading"
          />
          <Typography variant="fieldLabel" className="mt-md text-brand-muted">
            Target price (₹ / MT)
          </Typography>
          <TextInput
            value={targetPrice}
            onChangeText={setTargetPrice}
            placeholder="148000.00"
            placeholderTextColor={brandColors.muted}
            keyboardType="decimal-pad"
            className="mt-xs rounded-lg border border-brand-border bg-brand-surface px-md py-md font-sans text-[14px] text-brand-heading"
          />
          <View className="mt-md flex-row" style={{ gap: 8 }}>
            {(['BELOW', 'ABOVE'] as const).map((option) => (
              <Pressable
                key={option}
                onPress={() => setDirection(option)}
                className="flex-1 items-center rounded-lg border px-md py-md"
                style={{
                  borderColor:
                    direction === option ? brandColors.primary : brandColors.border,
                  backgroundColor:
                    direction === option ? brandColors.primaryLight : brandColors.white,
                }}
              >
                <Typography
                  variant="roleTitle"
                  className="text-[12px]"
                  style={{
                    color: direction === option ? brandColors.primary : brandColors.heading,
                  }}
                >
                  {option === 'BELOW' ? 'When below' : 'When above'}
                </Typography>
              </Pressable>
            ))}
          </View>
          <PrimaryButton
            label={isLoggedIn ? 'Save alert' : 'Sign in to save'}
            className="mt-lg"
            loading={saving}
            onPress={() => {
              void handleCreate();
            }}
          />
        </View>

        {evaluationNotice && !evaluationNotice.supported ? (
          <View className="mt-md rounded-xl border border-amber-200 bg-amber-50 p-lg">
            <Typography variant="roleTitle" className="text-[13px] text-amber-900">
              Evaluation not active
            </Typography>
            <Typography
              variant="caption"
              className="mt-xs font-sans text-[12px] normal-case text-amber-800"
            >
              {evaluationNotice.reason}
            </Typography>
          </View>
        ) : null}

        <View className="mt-lg">
          <Typography variant="roleTitle" className="mb-md text-[15px] text-brand-heading">
            Your alerts
          </Typography>
          {loading ? (
            <ActivityIndicator color={brandColors.primary} />
          ) : error ? (
            <Typography variant="subheadingLeft" className="text-red-600">
              {error}
            </Typography>
          ) : !isLoggedIn ? (
            <Typography variant="subheadingLeft" className="text-brand-muted">
              Sign in to view and manage your polymer price alerts.
            </Typography>
          ) : alerts.length === 0 ? (
            <Typography variant="subheadingLeft" className="text-brand-muted">
              No price alerts yet.
            </Typography>
          ) : (
            alerts.map((alert) => (
              <View
                key={alert.id}
                className="mb-md rounded-xl border border-brand-border bg-brand-white p-lg"
              >
                <Typography variant="roleTitle" className="text-[14px] text-brand-heading">
                  {alert.grade?.name ?? alert.gradeId}
                </Typography>
                <Typography
                  variant="caption"
                  className="mt-xs font-sans text-[12px] normal-case text-brand-muted"
                >
                  Notify when {alert.direction.toLowerCase()}{' '}
                  {formatEstimateMoney(alert.targetPrice)} / {alert.unit}
                  {alert.enabled ? '' : ' · paused'}
                </Typography>
                {alert.evaluation && !alert.evaluation.supported ? (
                  <Typography
                    variant="caption"
                    className="mt-sm font-sans text-[11px] normal-case text-brand-muted"
                  >
                    {alert.evaluation.reason}
                  </Typography>
                ) : null}
                <View className="mt-md flex-row" style={{ gap: 8 }}>
                  <SecondaryButton
                    label={alert.enabled ? 'Pause' : 'Enable'}
                    variant="outline"
                    className="flex-1"
                    onPress={() => {
                      void handleToggle(alert);
                    }}
                  />
                  <SecondaryButton
                    label="Delete"
                    variant="outline"
                    className="flex-1"
                    onPress={() => {
                      void handleDelete(alert);
                    }}
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
});
