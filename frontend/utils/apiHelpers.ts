export function apiErrorMessage(
  data: { message?: string; errors?: { msg?: string }[] },
  fallback: string
): string {
  if (data.message) return data.message;
  if (data.errors?.length) return data.errors[0].msg ?? fallback;
  return fallback;
}

export async function parseJson<T>(response: Response, fallback: string): Promise<T> {
  const text = await response.text();

  try {
    const data = JSON.parse(text) as { message?: string; errors?: { msg?: string }[] };

    if (!response.ok) {
      throw new Error(apiErrorMessage(data, fallback));
    }

    return data as T;
  } catch (err) {
    if (err instanceof Error && err.message !== fallback) {
      throw err;
    }
    throw new Error(fallback);
  }
}

export async function parseJsonResponse(response: Response, fallback: string): Promise<unknown> {
  return parseJson(response, fallback);
}
