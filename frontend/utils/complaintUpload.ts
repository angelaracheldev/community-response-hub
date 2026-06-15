import * as ImagePicker from 'expo-image-picker';
import { appendLocalFileToFormData } from './formDataUpload';

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

    await appendLocalFileToFormData(formData, 'files', {
      uri: asset.uri,
      name,
      type,
    });
  }

  return formData;
}
