import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

type IdFile = ImagePicker.ImagePickerAsset;

export async function buildVerificationFormData(
  address: string,
  idFile: IdFile,
  verificationType = 'ID'
): Promise<FormData> {
  const formData = new FormData();
  formData.append('verificationType', verificationType);
  formData.append('address', address);

  const name = idFile.fileName ?? 'id.jpg';
  const type = idFile.mimeType ?? 'image/jpeg';

  if (Platform.OS === 'web') {
    const response = await fetch(idFile.uri);
    const blob = await response.blob();
    formData.append('file', blob, name);
    return formData;
  }

  formData.append('file', { uri: idFile.uri, name, type } as unknown as Blob);
  return formData;
}
