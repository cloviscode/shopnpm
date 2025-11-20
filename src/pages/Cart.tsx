import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product } from '../types';
import Button from '../components/UI/Button';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, getCartTotal, getCartWeight, getShippingFee } = useCart();
  const { user } = useAuth();
  const [products] = useLocalStorage<Product[]>('products', []);
  const navigate = useNavigate();

  const cartProducts = items.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId)!
  })).filter(item => item.product);

  const subtotal = getCartTotal(products);
  const totalWeight = getCartWeight(products);
  const shippingFee = getShippingFee(totalWeight);
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link
            to="/products"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Cart Items ({items.reduce((total, item) => total + item.quantity, 0)})
                </h2>
                <div className="space-y-6">
                  {cartProducts.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                      <Link to={`/product/${product.id}`}>
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </Link>
                      <div className="flex-1">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm">{product.description.substring(0, 100)}...</p>
                        <p className="text-lg font-bold text-blue-600 mt-2">${product.price}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-2 text-gray-600 hover:text-gray-800"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="p-2 text-gray-600 hover:text-gray-800"
                            disabled={quantity >= product.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping ({totalWeight.toFixed(1)} kg)</span>
                  <span className="font-semibold">${shippingFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold text-blue-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {user ? (
                  <Button
                    onClick={() => navigate('/checkout')}
                    className="w-full"
                    size="lg"
                  >
                    Proceed to Checkout
                  </Button>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-3 text-center">
                      Please login to proceed with checkout
                    </p>
                    <Button
                      onClick={() => navigate('/login')}
                      className="w-full"
                      size="lg"
                    >
                      Login to Checkout
                    </Button>
                  </div>
                )}
                <Link
                  to="/products"
                  className="block w-full text-center py-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Shipping Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Shipping Information</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• 0-5kg: $10.00</p>
                  <p>• 5-10kg: $20.00</p>
                  <p>• 10-20kg: $35.00</p>
                  <p>• 20kg+: $50.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;