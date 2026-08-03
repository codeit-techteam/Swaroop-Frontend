import { memo, type ReactNode } from 'react';

import { View } from 'react-native';

import { PrimaryButton, Typography } from '@/components';
import {
  AlertCircleIcon,
  ClipboardCheckIcon,
  DocumentFileIcon,
  OrdersTabIcon,
  StoreIcon,
  TruckIcon,
} from '@/icons';
import { brandColors } from '@/theme/colors';
import { cn } from '@/utils/cn';

export type EmptyStateVariant =
  | 'no_orders'
  | 'no_offers'
  | 'no_products'
  | 'no_inventory'
  | 'no_shipments'
  | 'no_notifications'
  | 'no_documents'
  | 'no_search_results';

type EmptyStateConfig = {
  title: string;
  description: string;
  ctaLabel?: string;
  icon: ReactNode;
};

const EMPTY_STATE_CONFIG: Record<EmptyStateVariant, EmptyStateConfig> = {
  no_orders: {
    title: 'No Orders Yet',
    description: 'New buyer orders will appear here once they are placed against your offers.',
    ctaLabel: 'View Offers',
    icon: <OrdersTabIcon size={28} color={brandColors.primaryDark} />,
  },
  no_offers: {
    title: 'No Active Offers',
    description: 'Create bulk pricing agreements to start receiving orders from verified buyers.',
    ctaLabel: 'Create New Offer',
    icon: <StoreIcon size={28} color={brandColors.primaryDark} />,
  },
  no_products: {
    title: 'No Products Listed',
    description: 'Add your first product to begin managing inventory and creating offers.',
    ctaLabel: 'Add Product',
    icon: <StoreIcon size={28} color={brandColors.primaryDark} />,
  },
  no_inventory: {
    title: 'No Inventory Items',
    description: 'Stock levels will appear here once products are published to your catalog.',
    ctaLabel: 'Go to Products',
    icon: <ClipboardCheckIcon size={28} color={brandColors.primaryDark} />,
  },
  no_shipments: {
    title: 'No Shipments Found',
    description: 'Active and completed shipments will be listed here for tracking and dispatch.',
    ctaLabel: 'View Dispatch',
    icon: <TruckIcon size={28} color={brandColors.primaryDark} />,
  },
  no_notifications: {
    title: 'No Notifications',
    description: "You're all caught up. New alerts for orders, payments, and dispatch will appear here.",
    icon: <AlertCircleIcon size={28} color={brandColors.primaryDark} />,
  },
  no_documents: {
    title: 'No Documents Found',
    description: 'Upload compliance certificates, invoices, and trade documents to keep your account verified.',
    ctaLabel: 'Upload Document',
    icon: <DocumentFileIcon size={28} color={brandColors.primaryDark} />,
  },
  no_search_results: {
    title: 'No Results Found',
    description: 'Try a different search term or browse categories to find what you need.',
    icon: <AlertCircleIcon size={28} color={brandColors.primaryDark} />,
  },
};

type EmptyStateProps = {
  variant: EmptyStateVariant;
  title?: string;
  description?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  className?: string;
};

export const EmptyState = memo(function EmptyState({
  variant,
  title,
  description,
  ctaLabel,
  onCtaPress,
  className,
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[variant];
  const displayTitle = title ?? config.title;
  const displayDescription = description ?? config.description;
  const displayCta = ctaLabel ?? config.ctaLabel;

  return (
    <View
      className={cn(
        'items-center rounded-[24px] border border-brand-border bg-brand-white px-lg py-2xl',
        className,
      )}
    >
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-primary-light">
        {config.icon}
      </View>
      <Typography variant="roleTitle" className="mt-lg text-center">
        {displayTitle}
      </Typography>
      <Typography variant="subheading" className="mt-sm text-center">
        {displayDescription}
      </Typography>
      {displayCta && onCtaPress ? (
        <View className="mt-lg w-full">
          <PrimaryButton label={displayCta} onPress={onCtaPress} />
        </View>
      ) : null}
    </View>
  );
});
