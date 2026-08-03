import { memo, type ComponentProps } from 'react';

import { AppBottomSheetPicker, InputField, PrimaryButton } from '@/components';

type SellerPrimaryButtonProps = ComponentProps<typeof PrimaryButton>;
type SellerTextFieldProps = ComponentProps<typeof InputField>;
type SellerBottomSheetProps = ComponentProps<typeof AppBottomSheetPicker>;

export const SellerPrimaryButton = memo(function SellerPrimaryButton(
  props: SellerPrimaryButtonProps,
) {
  return (
    <PrimaryButton {...props} className={`rounded-2xl py-md ${props.className ?? ''}`.trim()} />
  );
});

export const SellerTextField = memo(function SellerTextField(props: SellerTextFieldProps) {
  return (
    <InputField {...props} containerClassName={`w-full ${props.containerClassName ?? ''}`.trim()} />
  );
});

export const SellerBottomSheet = memo(function SellerBottomSheet(props: SellerBottomSheetProps) {
  return <AppBottomSheetPicker {...props} />;
});
