import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Category, Product } from '../types';

const Categories: React.FC = () => {
  const [categories] = useLocalStorage<Category[]>('categories', []);
  const [products] = useLocalStorage<Product[]>('products', []);

  const getCategoryProductCount = (categoryId: string) => {
    return products.filter(product => product.categoryId === categoryId).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our carefully curated categories to find exactly what you're looking for. 
            From electronics to home goods, we have everything you need.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const productCount = getCategoryProductCount(category.id);
            
            return (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="aspect-w-16 aspect-h-12">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-300 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-200 text-sm">
                        {productCount} {productCount === 1 ? 'product' : 'products'} available
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 rounded-xl transition-colors" />
              </Link>
            );
          })}
        </div>

        {/* Featured Categories Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Shop by Category?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Shopping by category helps you discover products more efficiently and find exactly what you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Discovery</h3>
              <p className="text-gray-600">
                Find products quickly by browsing through organized categories tailored to your needs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Assurance</h3>
              <p className="text-gray-600">
                Every product in our categories is carefully selected and quality-tested for your satisfaction.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Get your products delivered quickly with our efficient shipping system across all categories.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Can't Find What You're Looking For?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Browse all our products or use our search feature to find exactly what you need. 
            Our customer service team is also here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Browse All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;