import { SellerEmptyState, SellerShell } from '@/seller/components';

type SellerProfileDetailScreenProps = {
  title: string;
  subtitle: string;
};

export const SellerProfileDetailScreen = ({ title, subtitle }: SellerProfileDetailScreenProps) => {
  return (
    <SellerShell section="settings" title={title} subtitle={subtitle}>
      <SellerEmptyState
        title={`${title} ready`}
        description="This profile section uses local mock data and is structured for future API integration."
      />
    </SellerShell>
  );
};
