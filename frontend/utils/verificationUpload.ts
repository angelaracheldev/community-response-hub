import { appendLocalFileToFormData } from './formDataUpload';

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

  await appendLocalFileToFormData(formData, 'file', {
    uri: idFile.uri,
    name,
    type,
  });
  return formData;
}
