import { memo, useCallback, useState } from 'react';

import { Pressable, View } from 'react-native';

import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import Toast from 'react-native-toast-message';

import { AppHeader, InputField, PrimaryButton, ScreenWrapper, Typography } from '@/components';
import { NATURE_OF_BUSINESS_OPTIONS } from '@/constants/documents';
import { useProfile } from '@/hooks/useProfile';
import { CameraIcon, GalleryIcon } from '@/icons';
import { customerKycErrorMessage } from '@/services/customer-kyc';
import { showInfoDialog } from '@/store/dialog-store';
import { brandColors } from '@/theme/colors';
import { emailSchema } from '@/utils/validators';

export const EditProfileScreen = memo(function EditProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [email, setEmail] = useState(profile.email);
  const [natureOfBusiness, setNatureOfBusiness] = useState(profile.natureOfBusiness);
  const [profilePhotoUri, setProfilePhotoUri] = useState(profile.profilePhotoUri);
  const [companyLogoUri, setCompanyLogoUri] = useState(profile.companyLogoUri);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const pickImage = useCallback(async (target: 'profile' | 'company') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showInfoDialog(
        'Permission required',
        'Allow photo library access in settings so you can upload a profile or company image.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const uri = result.assets[0].uri;

    if (target === 'profile') {
      setProfilePhotoUri(uri);
      return;
    }

    setCompanyLogoUri(uri);
  }, []);

  const onSave = useCallback(async () => {
    if (!displayName.trim()) {
      setError('Name is required.');
      return;
    }

    if (!emailSchema.safeParse(email).success) {
      setError('Enter a valid email address.');
      return;
    }

    if (!natureOfBusiness.trim()) {
      setError('Business nature is required.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        ...(email.trim() !== profile.email ? { email: email.trim() } : {}),
        ...(natureOfBusiness.trim() !== profile.natureOfBusiness
          ? { natureOfBusiness: natureOfBusiness.trim() }
          : {}),
        profilePhotoUri,
        companyLogoUri,
      });
    } catch (saveError) {
      setError(
        customerKycErrorMessage(saveError, 'Could not save your changes. Please try again.'),
      );
      setSaving(false);
      return;
    }
    setSaving(false);

    Toast.show({
      type: 'success',
      text1: 'Profile updated',
      text2: 'Your business details were saved to your PetroTrade account.',
      visibilityTime: 2000,
    });

    router.back();
  }, [
    companyLogoUri,
    displayName,
    email,
    natureOfBusiness,
    profile.email,
    profile.natureOfBusiness,
    profilePhotoUri,
    router,
    updateProfile,
  ]);

  return (
    <ScreenWrapper scrollable className="bg-brand-background" contentClassName="pb-xl">
      <AppHeader variant="back" title="Edit Profile" onBack={handleBack} />

      <View className="mt-lg gap-lg">
        <View className="flex-row gap-md">
          <Pressable
            onPress={() => void pickImage('profile')}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            className="h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-brand-border bg-brand-white"
          >
            {profilePhotoUri ? (
              <Image
                source={{ uri: profilePhotoUri }}
                className="h-full w-full"
                contentFit="cover"
              />
            ) : (
              <CameraIcon color={brandColors.primary} />
            )}
          </Pressable>

          <Pressable
            onPress={() => void pickImage('company')}
            accessibilityRole="button"
            accessibilityLabel="Change company logo"
            className="h-20 flex-1 items-center justify-center rounded-xl border border-dashed border-brand-border bg-brand-white"
          >
            {companyLogoUri ? (
              <Image
                source={{ uri: companyLogoUri }}
                className="h-12 w-12 rounded-md"
                contentFit="cover"
              />
            ) : (
              <GalleryIcon color={brandColors.primary} />
            )}
            <Typography
              variant="caption"
              className="mt-xs font-sans normal-case tracking-normal text-brand-muted"
            >
              {companyLogoUri ? 'Company logo updated' : 'Upload company logo'}
            </Typography>
          </Pressable>
        </View>

        <InputField
          label="Name *"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Enter your name"
        />

        <InputField
          label="Email *"
          value={email}
          onChangeText={setEmail}
          placeholder="business@company.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <InputField
          label="Phone (sign-in number)"
          value={profile.phone}
          editable={false}
          placeholder="10-digit mobile number"
        />

        <InputField
          label="Company Address (from GST registration)"
          value={profile.businessAddress}
          editable={false}
          placeholder="Verified with your GST in KYC"
          multiline
        />

        <InputField
          label="Business Nature *"
          value={natureOfBusiness}
          onChangeText={setNatureOfBusiness}
          placeholder={NATURE_OF_BUSINESS_OPTIONS[0]}
        />

        {error ? (
          <Typography variant="error" className="text-left">
            {error}
          </Typography>
        ) : null}

        <PrimaryButton
          label="Save Changes"
          onPress={() => void onSave()}
          loading={saving}
          disabled={saving}
          className="mt-md"
        />
      </View>
    </ScreenWrapper>
  );
});
