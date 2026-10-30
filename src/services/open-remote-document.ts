import { Linking, Platform } from 'react-native';

export type OpenRemoteDocumentInput = {
  url: string;
  fileName?: string | null;
  mimeType?: string | null;
  title?: string | null;
};

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

/** Keep a usable on-disk name while preserving the extension for MIME / preview apps. */
function sanitizeFileName(name: string, fallback = 'document'): string {
  const trimmed = name.trim() || fallback;
  const lastDot = trimmed.lastIndexOf('.');
  const base = lastDot > 0 ? trimmed.slice(0, lastDot) : trimmed;
  const ext = lastDot > 0 ? trimmed.slice(lastDot + 1) : '';
  const safeBase = base.replace(/[^\w.\-()+ ]+/g, '_').replace(/\s+/g, ' ').trim() || fallback;
  const safeExt = ext.replace(/[^\w]+/g, '').toLowerCase();
  const joined = safeExt ? `${safeBase.slice(0, 80)}.${safeExt}` : safeBase.slice(0, 96);
  return joined;
}

function guessMime(fileName: string, mimeType?: string | null): string | undefined {
  if (mimeType && mimeType.includes('/')) return mimeType;
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ext ? MIME_BY_EXT[ext] : undefined;
}

/**
 * Opens a short-lived signed storage URL the same way Customer WEB does
 * (`window.open`), but on native it downloads first then uses the system
 * preview / share sheet — Linking alone often fails for R2 signed URLs.
 */
export async function openSignedRemoteDocument(
  input: OpenRemoteDocumentInput,
): Promise<void> {
  const url = input.url?.trim();
  if (!url) {
    throw new Error('Document URL was not issued.');
  }

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    await Linking.openURL(url);
    return;
  }

  const { Directory, File, Paths } = await import('expo-file-system');
  const fileName = sanitizeFileName(input.fileName || input.title || 'document');
  const mimeType = guessMime(fileName, input.mimeType);

  const folder = new Directory(Paths.cache, 'signed-documents');
  folder.create({ intermediates: true, idempotent: true });

  const destination = new File(folder, fileName);
  const downloaded = await File.downloadFileAsync(url, destination, { idempotent: true });
  const previewOptions = {
    title: input.title?.trim() || fileName,
    mimeType,
  };

  try {
    if (await File.canPreview(downloaded, { mimeType })) {
      await File.preview(downloaded, previewOptions);
      return;
    }
  } catch {
    // Fall through to share / browser.
  }

  try {
    const Sharing = await import('expo-sharing');
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(downloaded.uri, {
        mimeType,
        dialogTitle: previewOptions.title,
        UTI: mimeType,
      });
      return;
    }
  } catch {
    // Fall through to Linking.
  }

  const opened = await Linking.openURL(url).then(
    () => true,
    () => false,
  );
  if (!opened) {
    throw new Error('Unable to open this document on your device.');
  }
}
