import { memo, useMemo } from 'react';

import { Alert, Pressable, ScrollView, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, SecondaryButton, Typography } from '@/components';
import { ClockIcon, LocationPinIcon, PhoneIcon, TruckIcon } from '@/icons';
import { brandColors } from '@/theme/colors';
import { DocumentCard, Timeline } from '@/seller/components/analytics';
import {
  SellerHeader,
  SellerPrimaryButton,
  StatusBadge,
} from '@/seller/components';
import { getShipmentById, simulateDocumentDownload } from '@/seller/services/sellerMockService';

const shipmentTimelineSteps = (
  timeline: NonNullable<ReturnType<typeof getShipmentById>>['timeline'],
) =>
  timeline.map((step) => ({
    id: step.id,
    label: step.label,
    status:
      step.status === 'completed'
        ? ('completed' as const)
        : step.status === 'current'
          ? ('current' as const)
          : ('pending' as const),
    timestamp: step.timestamp,
  }));

export const ShipmentDetailsScreen = memo(function ShipmentDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { shipmentId } = useLocalSearchParams<{ shipmentId?: string }>();

  const shipment = useMemo(
    () => (shipmentId ? getShipmentById(shipmentId) : undefined),
    [shipmentId],
  );

  if (!shipment) {
    return (
      <ScreenWrapper padded={false} className="bg-brand-background">
        <SellerHeader title="Shipment Detail" showBack onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-lg">
          <Typography variant="roleTitle">Shipment not found</Typography>
          <Pressable onPress={() => router.back()} className="mt-md">
            <Typography variant="link">Go back</Typography>
          </Pressable>
        </View>
      </ScreenWrapper>
    );
  }

  const handleDownload = async (title: string) => {
    const message = await simulateDocumentDownload(title);
    Alert.alert('Download', message);
  };

  const handleDownloadAll = async () => {
    for (const document of shipment.documents) {
      await simulateDocumentDownload(document.title);
    }
    Alert.alert('Download Docs', 'All shipment documents prepared for download.');
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader title="Shipment Detail" showBack onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <View className="mt-md rounded-2xl border border-brand-border bg-brand-white p-lg">
          <View className="flex-row items-start justify-between">
            <View>
              <Typography variant="legal" className="text-left text-brand-body">
                Order
              </Typography>
              <Typography variant="headingLeft" className="mt-xs text-[24px]">
                {shipment.orderId}
              </Typography>
            </View>
            <StatusBadge status={shipment.status} />
          </View>

          <View className="mt-lg gap-md">
            {[
              { label: 'Material', value: shipment.route.split(' → ')[0] ?? 'Polymer Grade' },
              { label: 'Vehicle', value: shipment.vehicle, icon: <TruckIcon size={16} color={brandColors.body} /> },
              { label: 'Driver', value: shipment.driver, icon: <PhoneIcon size={16} color={brandColors.body} /> },
              { label: 'Warehouse', value: shipment.warehouse, icon: <LocationPinIcon size={16} color={brandColors.body} /> },
              { label: 'Destination', value: shipment.destination, icon: <LocationPinIcon size={16} color={brandColors.body} /> },
              { label: 'ETA', value: shipment.eta, icon: <ClockIcon size={16} color={brandColors.body} /> },
            ].map((row) => (
              <View key={row.label} className="flex-row items-start gap-sm">
                {row.icon}
                <View className="flex-1">
                  <Typography variant="badge" className="text-[10px] uppercase text-brand-body">
                    {row.label}
                  </Typography>
                  <Typography variant="roleTitle" className="mt-0.5 text-[15px]">
                    {row.value}
                  </Typography>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
          <Typography variant="caption" className="text-left text-brand-heading">
            Status
          </Typography>
          <View className="mt-md flex-row flex-wrap gap-sm">
            {(['LIVE', 'STABLE', 'DELAYED'] as const).map((status) => {
              const active = shipment.status === status;
              return (
                <View
                  key={status}
                  className={`rounded-full px-md py-xs ${active ? 'bg-[#0B4A8B]' : 'bg-brand-surface'}`}
                >
                  <Typography
                    variant="badge"
                    className={active ? 'text-brand-white' : 'text-brand-body'}
                  >
                    {status}
                  </Typography>
                </View>
              );
            })}
          </View>
        </View>

        <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
          <Typography variant="caption" className="text-left text-brand-heading">
            Timeline
          </Typography>
          <View className="mt-md">
            <Timeline steps={shipmentTimelineSteps(shipment.timeline)} />
          </View>
        </View>

        <View className="mt-lg items-center justify-center rounded-2xl border border-dashed border-brand-border bg-brand-surface px-lg py-2xl">
          <LocationPinIcon size={32} color={brandColors.primary} />
          <Typography variant="roleTitle" className="mt-md text-center">
            Live Tracking Coming Soon
          </Typography>
          <Typography variant="subheading" className="mt-sm text-center">
            Static map placeholder for enterprise shipment visibility.
          </Typography>
        </View>

        <View className="mt-lg rounded-2xl border border-brand-border bg-brand-white p-lg">
          <Typography variant="caption" className="text-left text-brand-heading">
            Documents
          </Typography>
          <View className="mt-md gap-sm">
            {shipment.documents.map((document) => (
              <DocumentCard
                key={document.id}
                title={document.title}
                fileName={document.fileName}
                onDownload={() => void handleDownload(document.title)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-brand-border bg-brand-white px-lg pt-md"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="flex-row gap-md">
          <SecondaryButton
            label="Call Logistics"
            onPress={() => Alert.alert('Call Logistics', `Dialing ${shipment.driverPhone}`)}
            className="flex-1"
          />
          <SellerPrimaryButton
            label="Download Docs"
            onPress={() => void handleDownloadAll()}
            className="flex-1"
          />
        </View>
        <Pressable onPress={() => router.back()} className="mt-sm py-sm">
          <Typography variant="link" className="text-center">
            Back
          </Typography>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
});
