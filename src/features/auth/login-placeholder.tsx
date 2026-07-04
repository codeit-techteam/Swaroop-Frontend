import { View } from 'react-native';

import { ScreenContainer, Typography } from '@/components';
import { brandColors } from '@/theme/colors';

export const LoginPlaceholder = () => {
  return (
    <ScreenContainer backgroundColor={brandColors.white}>
      <View className="flex-1 items-center justify-center">
        <Typography variant="heading">Login Screen</Typography>
      </View>
    </ScreenContainer>
  );
};
