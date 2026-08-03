import { SellerEmptyState, SellerShell } from '@/seller/components';
import type { SellerMenuSection } from '@/seller/types';

type SellerModuleScreenProps = {
  section: SellerMenuSection;
  title: string;
  subtitle: string;
};

export const SellerModuleScreen = ({ section, title, subtitle }: SellerModuleScreenProps) => {
  return (
    <SellerShell section={section} title={title} subtitle={subtitle}>
      <SellerEmptyState
        title={`${title} module ready`}
        description="This placeholder uses local mock data and is structured so APIs can replace the content later."
      />
    </SellerShell>
  );
};
