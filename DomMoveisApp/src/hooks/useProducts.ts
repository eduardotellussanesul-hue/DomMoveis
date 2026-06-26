import { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import type { Product } from '../api/types/product';

export function useProducts(filters?: { categoria?: string; destaque?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAll(filters);
      setProducts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters?.categoria, filters?.destaque]);

  return { products, loading, error, refetch: fetchProducts };
}