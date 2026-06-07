import { useEffect, useState } from 'react';
import { API_BASE } from '../utils/apiConfig';

export type ComplaintCategory = {
  category_id: number;
  category_name: string;
  description?: string | null;
};

export function useComplaintCategories() {
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(`${API_BASE}/categories`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message ?? 'Failed to load categories');
        }
        if (!cancelled) {
          setCategories(data.categories ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load categories');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading, error };
}
