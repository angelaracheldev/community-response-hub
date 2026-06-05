import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const ALLOWED_MEDIA_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'video/mp4',
  'video/quicktime',
];

export function isAllowedMediaType(mimeType: string | undefined, assetType?: string): boolean {
  if (mimeType) {
    return ALLOWED_MEDIA_TYPES.includes(mimeType.toLowerCase());
  }
  return assetType === 'image' || assetType === 'video';
}

export async function buildComplaintMediaFormData(
  assets: ImagePicker.ImagePickerAsset[]
): Promise<FormData> {
  const formData = new FormData();

  for (const asset of assets) {
    const isVideo = asset.type === 'video';
    const name = asset.fileName ?? (isVideo ? 'evidence.mp4' : 'evidence.jpg');
    const type = asset.mimeType ?? (isVideo ? 'video/mp4' : 'image/jpeg');

    if (Platform.OS === 'web') {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      formData.append('files', blob, name);
    } else {
      formData.append('files', { uri: asset.uri, name, type } as unknown as Blob);
    }
  }

  return formData;
}
