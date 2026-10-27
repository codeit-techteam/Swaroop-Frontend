import { isAxiosError } from 'axios';

type MessagePayload = {
  message?: string | string[];
};

/** Prefer Nest/API body messages over Axios' generic status text. */
export const getApiErrorMessage = (error: unknown): string => {
  if (isAxiosError<MessagePayload>(error)) {
    const raw = error.response?.data?.message;
    if (Array.isArray(raw)) {
      const joined = raw
        .map((part) => (typeof part === 'string' ? part.trim() : ''))
        .filter(Boolean)
        .join('. ');
      if (joined) return joined;
    }
    if (typeof raw === 'string' && raw.trim()) {
      return raw.trim();
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
