import { useCallback, useMemo, useState } from 'react';

import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import Toast from 'react-native-toast-message';

import { DEFAULT_PAYMENT_MODE, MAX_RECEIPT_SIZE_BYTES } from '@/constants/paymentBanks';
import { useOrderStore } from '@/store/order-store';
import type { PaymentMode, PaymentProof, PaymentProofReceipt } from '@/types/order';
import { dayjs } from '@/utils/date';
import { getUtrValidationError, isValidUtr, normalizeUtr } from '@/utils/payment-proof';
import { requestCameraPermission, requestMediaLibraryPermission } from '@/utils/permissions';

const SUBMIT_DELAY_MS = 800;

type FormErrors = {
  bank?: string;
  utr?: string;
  receipt?: string;
};

type UsePaymentProofResult = {
  transactionDate: Date;
  setTransactionDate: (date: Date) => void;
  bank: string;
  setBank: (bank: string) => void;
  paymentMode: PaymentMode;
  setPaymentMode: (mode: PaymentMode) => void;
  utr: string;
  setUtr: (value: string) => void;
  receipt: PaymentProofReceipt | null;
  errors: FormErrors;
  isSubmitting: boolean;
  isFormValid: boolean;
  handleUtrChange: (value: string) => void;
  pickFromGallery: () => Promise<void>;
  pickFromCamera: () => Promise<void>;
  removeReceipt: () => void;
  replaceReceipt: () => Promise<void>;
  submitPaymentProof: () => Promise<boolean>;
};

const buildReceipt = (
  name: string,
  uri: string,
  size: number,
  mimeType?: string | null,
): PaymentProofReceipt => ({
  name,
  uri,
  size,
  mimeType,
});

const validateReceiptSize = (size: number): boolean => size <= MAX_RECEIPT_SIZE_BYTES;

export const usePaymentProof = (orderId: string, amount: number): UsePaymentProofResult => {
  const submitToStore = useOrderStore((state) => state.submitPaymentProof);

  const [transactionDate, setTransactionDate] = useState(() => dayjs().startOf('day').toDate());
  const [bank, setBank] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(DEFAULT_PAYMENT_MODE);
  const [utr, setUtr] = useState('');
  const [receipt, setReceipt] = useState<PaymentProofReceipt | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUtrChange = useCallback((value: string) => {
    const normalized = normalizeUtr(value);
    setUtr(normalized);
    setErrors((prev) => ({ ...prev, utr: undefined }));
  }, []);

  const setReceiptWithValidation = useCallback((next: PaymentProofReceipt) => {
    if (!validateReceiptSize(next.size)) {
      setErrors((prev) => ({
        ...prev,
        receipt: 'File must be 10 MB or smaller.',
      }));
      Toast.show({
        type: 'error',
        text1: 'File too large',
        text2: 'Maximum file size is 10 MB.',
        visibilityTime: 2400,
      });
      return;
    }

    setReceipt(next);
    setErrors((prev) => ({ ...prev, receipt: undefined }));
  }, []);

  const pickFromGallery = useCallback(async () => {
    const permission = await requestMediaLibraryPermission();
    if (permission !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Gallery access denied',
        text2: 'Enable photo library access to upload payment proof.',
        visibilityTime: 2800,
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const size = asset.fileSize ?? 0;
    const name = asset.fileName ?? `receipt-${Date.now()}.jpg`;

    setReceiptWithValidation(buildReceipt(name, asset.uri, size, asset.mimeType ?? 'image/jpeg'));
  }, [setReceiptWithValidation]);

  const pickFromCamera = useCallback(async () => {
    const permission = await requestCameraPermission();
    if (permission !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Camera access denied',
        text2: 'Enable camera access to capture payment proof.',
        visibilityTime: 2800,
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.9,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const size = asset.fileSize ?? 0;
    const name = asset.fileName ?? `receipt-${Date.now()}.jpg`;

    setReceiptWithValidation(buildReceipt(name, asset.uri, size, asset.mimeType ?? 'image/jpeg'));
  }, [setReceiptWithValidation]);

  const pickPdfFromDocuments = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const size = asset.size ?? 0;

      setReceiptWithValidation(
        buildReceipt(asset.name, asset.uri, size, asset.mimeType ?? 'application/pdf'),
      );
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Unable to open file picker',
        visibilityTime: 2400,
      });
    }
  }, [setReceiptWithValidation]);

  const removeReceipt = useCallback(() => {
    setReceipt(null);
    setErrors((prev) => ({ ...prev, receipt: undefined }));
  }, []);

  const replaceReceipt = useCallback(async () => {
    await pickPdfFromDocuments();
  }, [pickPdfFromDocuments]);

  const isFormValid = useMemo(() => {
    if (!bank.trim()) {
      return false;
    }
    if (!isValidUtr(utr)) {
      return false;
    }
    if (!receipt) {
      return false;
    }
    if (!transactionDate) {
      return false;
    }
    return true;
  }, [bank, receipt, transactionDate, utr]);

  const submitPaymentProof = useCallback(async (): Promise<boolean> => {
    const nextErrors: FormErrors = {};

    if (!bank.trim()) {
      nextErrors.bank = 'Please select your bank';
    }

    const utrError = getUtrValidationError(utr);
    if (utrError) {
      nextErrors.utr = utrError;
    }

    if (!receipt) {
      nextErrors.receipt = 'Please upload a payment receipt';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return false;
    }

    setIsSubmitting(true);

    await new Promise<void>((resolve) => {
      setTimeout(resolve, SUBMIT_DELAY_MS);
    });

    const proof: PaymentProof = {
      orderId,
      amount,
      bank,
      paymentMode,
      transactionDate: dayjs(transactionDate).format('YYYY-MM-DD'),
      utr: normalizeUtr(utr),
      receipt: receipt as PaymentProofReceipt,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    };

    submitToStore(proof);
    setIsSubmitting(false);
    return true;
  }, [amount, bank, orderId, paymentMode, receipt, submitToStore, transactionDate, utr]);

  return {
    transactionDate,
    setTransactionDate,
    bank,
    setBank,
    paymentMode,
    setPaymentMode,
    utr,
    setUtr,
    receipt,
    errors,
    isSubmitting,
    isFormValid,
    handleUtrChange,
    pickFromGallery,
    pickFromCamera,
    removeReceipt,
    replaceReceipt,
    submitPaymentProof,
  };
};
