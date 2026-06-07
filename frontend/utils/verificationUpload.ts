import { Platform } from 'react-native';

type VerificationFile = {
  uri: string;
  name: string;
  type: string;
  size: number;
};

export async function buildVerificationFormData(
  address: string,
  idFile: VerificationFile,
  verificationType = 'ID'
): Promise<FormData> {
  const formData = new FormData();
  formData.append('verificationType', verificationType);
  formData.append('address', address);

  const name = idFile.name ?? 'id.jpg';
  const type = idFile.type ?? 'image/jpeg';

  if (Platform.OS === 'web') {
    const response = await fetch(idFile.uri);
    const blob = await response.blob();
    formData.append('file', blob, name);
    return formData;
  }

  formData.append('file', { uri: idFile.uri, name, type } as unknown as Blob);
  return formData;
}
