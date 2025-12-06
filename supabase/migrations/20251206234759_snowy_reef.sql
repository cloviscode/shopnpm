/*
  # E-commerce Database Schema

  1. New Tables
    - `users` - User accounts with authentication
    - `categories` - Product categories
    - `brands` - Product brands
    - `products` - Product catalog
    - `addresses` - User shipping addresses
    - `orders` - Customer orders
    - `order_items` - Items within orders
    - `contact_messages` - Contact form submissions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Admin-only policies for management tables
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  weight decimal(8,2) NOT NULL DEFAULT 0,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  images text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  street text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  country text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  shipping_address jsonb NOT NULL,
  payment_method text NOT NULL,
  payment_status text DEFAULT 'pending',
  status text DEFAULT 'pending',
  subtotal decimal(10,2) NOT NULL,
  shipping_fee decimal(10,2) NOT NULL,
  total decimal(10,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  product_name text NOT NULL,
  product_image text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (true);

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

-- Brands policies (public read, admin write)
CREATE POLICY "Anyone can read brands" ON brands
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage brands" ON brands
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can read products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

-- Addresses policies
CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL USING (auth.uid()::text = user_id);

-- Orders policies
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Admins can read all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

-- Order items policies
CREATE POLICY "Users can read own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id AND user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_id AND user_id = auth.uid()::text
    )
  );

CREATE POLICY "Admins can read all order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

-- Contact messages policies
CREATE POLICY "Anyone can create contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read contact messages" ON contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

CREATE POLICY "Admins can update contact messages" ON contact_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text AND is_admin = true
    )
  );

-- Insert initial data
INSERT INTO categories (name, image) VALUES
  ('Electronics', 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Clothing', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Home & Garden', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400');

INSERT INTO brands (name) VALUES
  ('TechPro'),
  ('StyleMax'),
  ('HomeComfort');

-- Insert sample products
INSERT INTO products (name, description, price, stock, weight, category_id, brand_id, images) 
SELECT 
  'Wireless Bluetooth Headphones',
  'Premium quality wireless headphones with noise cancellation and 30-hour battery life.',
  199.99,
  50,
  0.3,
  c.id,
  b.id,
  ARRAY[
    'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=600'
  ]
FROM categories c, brands b 
WHERE c.name = 'Electronics' AND b.name = 'TechPro';

INSERT INTO products (name, description, price, stock, weight, category_id, brand_id, images) 
SELECT 
  'Smart Fitness Watch',
  'Advanced fitness tracking with heart rate monitor, GPS, and waterproof design.',
  299.99,
  30,
  0.2,
  c.id,
  b.id,
  ARRAY[
    'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=600'
  ]
FROM categories c, brands b 
WHERE c.name = 'Electronics' AND b.name = 'TechPro';

INSERT INTO products (name, description, price, stock, weight, category_id, brand_id, images) 
SELECT 
  'Premium Cotton T-Shirt',
  'Comfortable 100% organic cotton t-shirt available in multiple colors and sizes.',
  29.99,
  100,
  0.2,
  c.id,
  b.id,
  ARRAY[
    'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1656686/pexels-photo-1656686.jpeg?auto=compress&cs=tinysrgb&w=600'
  ]
FROM categories c, brands b 
WHERE c.name = 'Clothing' AND b.name = 'StyleMax';

INSERT INTO products (name, description, price, stock, weight, category_id, brand_id, images) 
SELECT 
  'Designer Jeans',
  'Premium denim jeans with perfect fit and contemporary styling.',
  89.99,
  75,
  0.8,
  c.id,
  b.id,
  ARRAY[
    'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600'
  ]
FROM categories c, brands b 
WHERE c.name = 'Clothing' AND b.name = 'StyleMax';

INSERT INTO products (name, description, price, stock, weight, category_id, brand_id, images) 
SELECT 
  'Ceramic Plant Pot Set',
  'Beautiful set of 3 ceramic plant pots perfect for indoor gardening.',
  45.99,
  40,
  2.5,
  c.id,
  b.id,
  ARRAY[
    'https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1005059/pexels-photo-1005059.jpeg?auto=compress&cs=tinysrgb&w=600'
  ]
FROM categories c, brands b 
WHERE c.name = 'Home & Garden' AND b.name = 'HomeComfort';

INSERT INTO products (name, description, price, stock, weight, category_id, brand_id, images) 
SELECT 
  'LED Desk Lamp',
  'Modern LED desk lamp with adjustable brightness and USB charging port.',
  79.99,
  25,
  1.2,
  c.id,
  b.id,
  ARRAY[
    'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1112599/pexels-photo-1112599.jpeg?auto=compress&cs=tinysrgb&w=600'
  ]
FROM categories c, brands b 
WHERE c.name = 'Home & Garden' AND b.name = 'HomeComfort';

-- Create admin user (password: admin123)
INSERT INTO users (email, password, name, phone, is_admin) VALUES
  ('admin@ecommerce.com', '$2b$10$rOvHPGkwMkLNRlgCvd2ZUeQs6wvUzBtfU5PJMfqMZvU5PJMfqMZvU5', 'Admin User', '+1234567890', true);