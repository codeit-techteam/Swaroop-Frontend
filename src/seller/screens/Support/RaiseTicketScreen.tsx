import { memo, useState } from 'react';

import { Pressable, ScrollView, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, ScreenWrapper, Typography } from '@/components';
import { CloudUploadIcon } from '@/icons';
import { ROUTES } from '@/navigation/routes';
import { SellerHeader, SellerTextField, StatusBottomSheet } from '@/seller/components';
import {
  TICKET_CATEGORY_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
} from '@/seller/mock/support';
import { useSellerSupport } from '@/seller/hooks/useSellerSupport';
import type { TicketCategory, TicketPriority } from '@/seller/types/support';
import { brandColors } from '@/theme/colors';

export const RaiseTicketScreen = memo(function RaiseTicketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { submitTicket } = useSellerSupport();

  const [category, setCategory] = useState<TicketCategory>('order_issue');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSheet, setSuccessSheet] = useState(false);
  const [errorSheet, setErrorSheet] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      setErrorSheet(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitTicket({ category, priority, subject, description, attachmentName });
      setSuccessSheet(true);
    } catch {
      setErrorSheet(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttach = () => {
    setAttachmentName('support-attachment.pdf');
  };

  return (
    <ScreenWrapper padded={false} className="bg-brand-background">
      <SellerHeader title="Raise Ticket" showBack onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-lg"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <Typography variant="subheading" className="mt-md text-brand-body">
          Describe your issue and our support team will respond within 24 hours.
        </Typography>

        <View className="mt-lg">
          <Typography variant="badge" className="mb-sm text-[11px] uppercase tracking-wide text-brand-body">
            Category
          </Typography>
          <View className="flex-row flex-wrap gap-sm">
            {TICKET_CATEGORY_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setCategory(opt.value)}
                className={`rounded-full px-md py-sm ${category === opt.value ? 'bg-brand-primary' : 'border border-brand-border bg-brand-white'}`}
              >
                <Typography
                  variant="badge"
                  className={category === opt.value ? 'text-brand-white' : 'text-brand-body'}
                >
                  {opt.label}
                </Typography>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-lg">
          <Typography variant="badge" className="mb-sm text-[11px] uppercase tracking-wide text-brand-body">
            Priority
          </Typography>
          <View className="flex-row flex-wrap gap-sm">
            {TICKET_PRIORITY_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setPriority(opt.value)}
                className={`rounded-full px-md py-sm ${priority === opt.value ? 'bg-brand-primary' : 'border border-brand-border bg-brand-white'}`}
              >
                <Typography
                  variant="badge"
                  className={priority === opt.value ? 'text-brand-white' : 'text-brand-body'}
                >
                  {opt.label}
                </Typography>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-lg gap-md">
          <SellerTextField label="Subject" value={subject} onChangeText={setSubject} placeholder="Brief summary" />
          <SellerTextField
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Provide details about your issue"
            multiline
          />
        </View>

        <Pressable
          onPress={handleAttach}
          className="mt-lg flex-row items-center gap-md rounded-[22px] border border-dashed border-brand-border bg-brand-white px-lg py-lg"
        >
          <CloudUploadIcon size={24} color={brandColors.primaryDark} />
          <View className="flex-1">
            <Typography variant="roleTitle">Attachment</Typography>
            <Typography variant="legal" className="text-brand-body">
              {attachmentName ?? 'Tap to attach a file (optional)'}
            </Typography>
          </View>
        </Pressable>

        <View className="mt-xl">
          <PrimaryButton
            label={isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            onPress={() => void handleSubmit()}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>

      <StatusBottomSheet
        visible={successSheet}
        variant="success"
        title="Ticket Created Successfully"
        message="Your support ticket has been submitted. Our team will respond shortly."
        onDismiss={() => {
          setSuccessSheet(false);
          router.replace(ROUTES.SELLER.SUPPORT as Href);
        }}
      />

      <StatusBottomSheet
        visible={errorSheet}
        variant="error"
        title="Validation Error"
        message="Please fill in the subject and description before submitting."
        onDismiss={() => setErrorSheet(false)}
      />
    </ScreenWrapper>
  );
});
