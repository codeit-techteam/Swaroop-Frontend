import { useEffect } from 'react';

import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper, Typography } from '@/components';
import { SellerCard, SellerHeader } from '@/seller/components';
import { usePullToRefresh } from '@/seller/hooks/usePullToRefresh';
import { useSellerStore } from '@/seller/store/sellerStore';
import {
  formatSellerAddress,
  formatSellerTypeLabel,
  type SellerAccountSummary,
} from '@/services/seller-profile';
import { brandColors } from '@/theme/colors';

export type SellerProfileSection =
  | 'company'
  | 'gst'
  | 'address'
  | 'bank'
  | 'contact'
  | 'kyc'
  | 'licenses';

type SellerProfileDetailScreenProps = {
  section: SellerProfileSection;
  title: string;
  subtitle: string;
};

type Row = [label: string, value: string | null | undefined];

const STATUS_LABELS: Record<string, string> = {
  APPROVED: 'Verified',
  VERIFIED: 'Verified',
  UNDER_REVIEW: 'Under review',
  PENDING: 'Pending',
  PENDING_VERIFICATION: 'Pending verification',
  SUBMITTED: 'Submitted',
  REJECTED: 'Rejected',
  DRAFT: 'Draft',
};

const statusLabel = (value: string | null | undefined) =>
  value ? (STATUS_LABELS[value] ?? value.replace(/_/g, ' ').toLowerCase()) : null;

const verifiedLabel = (verified: boolean) => (verified ? 'Verified' : 'Pending verification');

function rowsFor(section: SellerProfileSection, account: SellerAccountSummary): Row[] {
  switch (section) {
    case 'company':
      return [
        ['Company', account.companyName],
        ['Legal name', account.legalName],
        ['Business type', account.businessType],
        ['Seller type', formatSellerTypeLabel(account)],
        ['Industry', account.industry],
        ['Years in business', account.yearsInBusiness],
        ['Payment terms', account.paymentTerms],
        ['Status', statusLabel(account.status)],
      ];
    case 'gst':
      return [
        ['GSTIN', account.gstin],
        ['GST state', account.gstState],
        ['GST verification', verifiedLabel(account.gstVerified)],
        ['PAN', account.pan],
        ['PAN verification', verifiedLabel(account.panVerified)],
      ];
    case 'address':
      return [
        ['Registered address', account.address?.line1 ?? account.registeredAddress],
        ['City', account.address?.city],
        ['State', account.address?.state],
        ['Pincode', account.address?.postalCode],
        ['Summary', formatSellerAddress(account)],
      ];
    case 'bank':
      return [
        ['Account holder', account.bank?.accountHolder],
        ['Bank', account.bank?.bankName],
        ['Account number', account.bank?.accountNumberMasked],
        ['IFSC', account.bank?.ifsc],
        ['Branch', account.bank?.branch],
        ['Verification', verifiedLabel(account.bankVerified)],
      ];
    case 'contact':
      return [
        ['Account owner', account.ownerName],
        ['Contact person', account.contactName],
        ['Designation', account.designation],
        ['Mobile', account.phone],
        ['Email', account.email],
      ];
    case 'kyc':
      return [
        ['Overall verification', statusLabel(account.verificationStatus)],
        ['Documents on file', String(account.kycDocumentsCount)],
        ['GST', verifiedLabel(account.gstVerified)],
        ['PAN', verifiedLabel(account.panVerified)],
        ['Bank', verifiedLabel(account.bankVerified)],
      ];
    case 'licenses':
      return [
        ['Overall verification', statusLabel(account.verificationStatus)],
        ['Documents on file', String(account.kycDocumentsCount)],
      ];
  }
}

const FOOTNOTES: Partial<Record<SellerProfileSection, string>> = {
  gst: 'Verified GST and PAN are locked. Contact PetroTrade support to request re-verification.',
  bank: 'Settlements are paid to this account. Contact support to change verified bank details.',
  contact: 'Profile changes made on Seller Web appear here after you pull to refresh.',
  licenses: 'Upload and manage licenses from the Documents Center.',
};

export const SellerProfileDetailScreen = ({
  section,
  title,
  subtitle,
}: SellerProfileDetailScreenProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const account = useSellerStore((state) => state.account);
  const accountStatus = useSellerStore((state) => state.accountStatus);
  const accountError = useSellerStore((state) => state.accountError);
  const refreshSellerAccount = useSellerStore((state) => state.refreshSellerAccount);
  const { isRefreshing, refresh } = usePullToRefresh(async () => {
    await refreshSellerAccount();
  });

  useEffect(() => {
    void refreshSellerAccount();
  }, [refreshSellerAccount]);

  const rows = account ? rowsFor(section, account) : [];
  const footnote = FOOTNOTES[section];

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader showBack title={title} subtitle={subtitle} onBack={() => router.back()} />
      <ScrollView
        className="flex-1 px-xl"
        contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 32 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} />
        }
      >
        {account ? (
          <SellerCard title={account.companyName}>
            {rows.map(([label, value], index) => (
              <View
                key={label}
                className={index === 0 ? 'py-sm' : 'border-t border-brand-border py-sm'}
              >
                <Typography variant="legal" className="text-left text-brand-footer">
                  {label}
                </Typography>
                <Typography variant="body" className="mt-xs text-left text-brand-heading">
                  {value?.trim() ? value : '—'}
                </Typography>
              </View>
            ))}
          </SellerCard>
        ) : accountStatus === 'error' ? (
          <View className="items-center rounded-2xl bg-brand-white p-lg">
            <Typography variant="body" className="text-center text-brand-heading">
              {accountError ?? 'Could not load seller profile.'}
            </Typography>
            <Pressable
              onPress={() => void refreshSellerAccount()}
              accessibilityRole="button"
              className="mt-md rounded-full bg-brand-primary px-lg py-sm"
            >
              <Typography variant="badge" className="text-brand-white">
                Retry
              </Typography>
            </Pressable>
          </View>
        ) : (
          <View className="items-center py-2xl">
            <ActivityIndicator color={brandColors.primary} />
          </View>
        )}

        {account && footnote ? (
          <Typography variant="legal" className="mt-md text-left text-brand-footer">
            {footnote}
          </Typography>
        ) : null}
      </ScrollView>
    </ScreenWrapper>
  );
};
