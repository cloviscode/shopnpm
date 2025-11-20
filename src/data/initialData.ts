import { User, Category, Brand, Product, SiteSettings } from '../types';

export const initialAdmin: User = {
  id: 'admin-1',
  email: 'admin@ecommerce.com',
  password: 'admin123',
  name: 'Admin User',
  phone: '+1234567890',
  isAdmin: true,
  addresses: [],
  createdAt: new Date('2024-01-01'),
};

export const initialCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Electronics',
    image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-2',
    name: 'Clothing',
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-3',
    name: 'Home & Garden',
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    createdAt: new Date('2024-01-01'),
  },
];

export const initialBrands: Brand[] = [
  {
    id: 'brand-1',
    name: 'TechPro',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'brand-2',
    name: 'StyleMax',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'brand-3',
    name: 'HomeComfort',
    createdAt: new Date('2024-01-01'),
  },
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium quality wireless headphones with noise cancellation and 30-hour battery life.',
    price: 199.99,
    stock: 50,
    weight: 0.3,
    categoryId: 'cat-1',
    brandId: 'brand-1',
    images: [
      'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=600',
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'prod-2',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking with heart rate monitor, GPS, and waterproof design.',
    price: 299.99,
    stock: 30,
    weight: 0.2,
    categoryId: 'cat-1',
    brandId: 'brand-1',
    images: [
      'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=600',
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'prod-3',
    name: 'Premium Cotton T-Shirt',
    description: 'Comfortable 100% organic cotton t-shirt available in multiple colors and sizes.',
    price: 29.99,
    stock: 100,
    weight: 0.2,
    categoryId: 'cat-2',
    brandId: 'brand-2',
    images: [
      'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1656686/pexels-photo-1656686.jpeg?auto=compress&cs=tinysrgb&w=600',
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'prod-4',
    name: 'Designer Jeans',
    description: 'Premium denim jeans with perfect fit and contemporary styling.',
    price: 89.99,
    stock: 75,
    weight: 0.8,
    categoryId: 'cat-2',
    brandId: 'brand-2',
    images: [
      'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600',
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'prod-5',
    name: 'Ceramic Plant Pot Set',
    description: 'Beautiful set of 3 ceramic plant pots perfect for indoor gardening.',
    price: 45.99,
    stock: 40,
    weight: 2.5,
    categoryId: 'cat-3',
    brandId: 'brand-3',
    images: [
      'https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1005059/pexels-photo-1005059.jpeg?auto=compress&cs=tinysrgb&w=600',
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'prod-6',
    name: 'LED Desk Lamp',
    description: 'Modern LED desk lamp with adjustable brightness and USB charging port.',
    price: 79.99,
    stock: 25,
    weight: 1.2,
    categoryId: 'cat-3',
    brandId: 'brand-3',
    images: [
      'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1112599/pexels-photo-1112599.jpeg?auto=compress&cs=tinysrgb&w=600',
    ],
    createdAt: new Date('2024-01-01'),
  },
];

export const initialSiteSettings: SiteSettings = {
  siteName: 'EliteShop',
  siteDescription: 'Your premium destination for quality products',
  contactEmail: 'contact@eliteshop.com',
  contactPhone: '+1 (555) 123-4567',
  socialMedia: {
    facebook: 'https://facebook.com/eliteshop',
    twitter: 'https://twitter.com/eliteshop',
    instagram: 'https://instagram.com/eliteshop',
  },
  locations: [
    '123 Main Street, New York, NY 10001',
    '456 Oak Avenue, Los Angeles, CA 90210',
  ],
};

export const initializeData = () => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([initialAdmin]));
  }
  if (!localStorage.getItem('categories')) {
    localStorage.setItem('categories', JSON.stringify(initialCategories));
  }
  if (!localStorage.getItem('brands')) {
    localStorage.setItem('brands', JSON.stringify(initialBrands));
  }
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(initialProducts));
  }
  if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify([]));
  }
  if (!localStorage.getItem('contactMessages')) {
    localStorage.setItem('contactMessages', JSON.stringify([]));
  }
  if (!localStorage.getItem('siteSettings')) {
    localStorage.setItem('siteSettings', JSON.stringify(initialSiteSettings));
  }
};