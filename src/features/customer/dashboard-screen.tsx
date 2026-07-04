import { View } from 'react-native';

import { ScreenWrapper, Typography } from '@/components';
import { PetroTradeLogo } from '@/icons';

export const CustomerDashboardScreen = () => {
  return (
    <ScreenWrapper className="bg-brand-white">
      <View className="flex-1 items-center justify-center">
        <PetroTradeLogo size={64} />
        <Typography variant="heading" className="mt-lg">
          Customer Dashboard
        </Typography>
        <Typography variant="subheading" className="mt-sm">
          Coming Soon
        </Typography>
      </View>
    </ScreenWrapper>
  );
};
