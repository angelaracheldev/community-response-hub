import { File } from 'expo-file-system';
import { Platform } from 'react-native';

export type LocalFilePayload = {
  uri: string;
  name: string;
  type: string;
};

export async function appendLocalFileToFormData(
  formData: FormData,
  fieldName: string,
  file: LocalFilePayload
): Promise<void> {
  if (Platform.OS === 'web') {
    const response = await fetch(file.uri);
    if (!response.ok) {
      throw new Error(`Unable to read file "${file.name}".`);
    }

    const data = await response.arrayBuffer();
    const blob = new Blob([data], { type: file.type });
    formData.append(fieldName, blob, file.name);
    return;
  }

  formData.append(fieldName, new File(file.uri));
}
