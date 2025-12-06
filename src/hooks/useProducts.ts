import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  weight: number;
  category_id: string;
  brand_id: string;
  images: string[];
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  image: string;
  created_at: string;
}

interface Brand {
  id: string;
  name: string;
  created_at: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          supabase.from('products').select('*').order('created_at', { ascending: false }),
          supabase.from('categories').select('*').order('name'),
          supabase.from('brands').select('*').order('name')
        ]);

        if (productsRes.data) setProducts(productsRes.data);
        if (categoriesRes.data) setCategories(categoriesRes.data);
        if (brandsRes.data) setBrands(brandsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      return null;
    }

    setProducts(prev => [data, ...prev]);
    return data;
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return null;
    }

    setProducts(prev => prev.map(p => p.id === id ? data : p));
    return data;
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }

    setProducts(prev => prev.filter(p => p.id !== id));
    return true;
  };

  return {
    products,
    categories,
    brands,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: () => {
      setLoading(true);
      // Re-fetch data
    }
  };
};