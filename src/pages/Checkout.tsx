import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, MapPin, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Product, Order, OrderItem, Address } from '../types';
import Button from '../components/UI/Button';
import { v4 as uuidv4 } from 'uuid';

const Checkout: React.FC = () => {
  const { items, getCartTotal, getCartWeight, getShippingFee, clearCart } = useCart();
  const { user, updateUser } = useAuth();
  const [products] = useLocalStorage<Product[]>('products', []);
  const [orders, setOrders] = useLocalStorage<Order[]>('orders', []);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState<Address>({
    id: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false,
  });
  
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'bank_transfer'>('cash_on_delivery');

  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const cartProducts = items.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId)!
  })).filter(item => item.product);

  const subtotal = getCartTotal(products);
  const totalWeight = getCartWeight(products);
  const shippingFee = getShippingFee(totalWeight);
  const total = subtotal + shippingFee;

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      alert('Please fill in all address fields');
      return;
    }
    setStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      const orderItems: OrderItem[] = cartProducts.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
        price: product.price,
        productName: product.name,
        productImage: product.images[0],
      }));

      const newOrder: Order = {
        id: uuidv4(),
        userId: user.id,
        items: orderItems,
        shippingAddress: { ...shippingAddress, id: uuidv4() },
        paymentMethod,
        status: 'pending',
        subtotal,
        shippingFee,
        total,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save order
      setOrders(prev => [...prev, newOrder]);

      // Update product stock
      const updatedProducts = products.map(product => {
        const orderItem = orderItems.find(item => item.productId === product.id);
        if (orderItem) {
          return { ...product, stock: product.stock - orderItem.quantity };
        }
        return product;
      });
      localStorage.setItem('products', JSON.stringify(updatedProducts));

      // Save address to user profile if new
      if (!user.addresses.some(addr => 
        addr.street === shippingAddress.street && 
        addr.city === shippingAddress.city
      )) {
        const newAddress = { ...shippingAddress, id: uuidv4() };
        updateUser({
          addresses: [...user.addresses, newAddress]
        });
      }

      // Clear cart
      clearCart();

      // Redirect to success page
      navigate(`/order-success/${newOrder.id}`);
    } catch (error) {
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {step > 1 ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <span className={step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Shipping</span>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {step > 2 ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <span className={step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Payment</span>
            <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {step > 3 ? <Check className="h-4 w-4" /> : '3'}
            </div>
            <span className={step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Review</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Address */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <MapPin className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                </div>

                {/* Saved Addresses */}
                {user.addresses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">Saved Addresses</h3>
                    <div className="space-y-3">
                      {user.addresses.map((address) => (
                        <div
                          key={address.id}
                          className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
                          onClick={() => setShippingAddress(address)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{address.street}</p>
                              <p className="text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                              <p className="text-gray-600">{address.country}</p>
                            </div>
                            <input
                              type="radio"
                              checked={shippingAddress.id === address.id}
                              onChange={() => setShippingAddress(address)}
                              className="text-blue-600"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setShippingAddress({
                          id: '',
                          street: '',
                          city: '',
                          state: '',
                          zipCode: '',
                          country: '',
                          isDefault: false,
                        })}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        + Add New Address
                      </button>
                    </div>
                  </div>
                )}

                {/* New Address Form */}
                {(!user.addresses.length || !shippingAddress.id) && (
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.zipCode}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.country}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </form>
                )}

                {shippingAddress.street && (
                  <div className="mt-6">
                    <Button onClick={() => setStep(2)} className="w-full" size="lg">
                      Continue to Payment
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                      <input
                        type="radio"
                        value="cash_on_delivery"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash_on_delivery')}
                        className="text-blue-600 mr-3"
                      />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-gray-600 text-sm">Pay when your order is delivered</p>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                      <input
                        type="radio"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'bank_transfer')}
                        className="text-blue-600 mr-3"
                      />
                      <div>
                        <p className="font-medium">Bank Transfer</p>
                        <p className="text-gray-600 text-sm">Transfer payment to our bank account</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" size="lg">
                      Review Order
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Order Review */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Order Review</h2>

                {/* Shipping Address Review */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <p>{shippingAddress.street}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                  <p>{shippingAddress.country}</p>
                </div>

                {/* Payment Method Review */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Payment Method</h3>
                  <p>{paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Bank Transfer'}</p>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-medium mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {cartProducts.map(({ product, quantity }) => (
                      <div key={product.id} className="flex items-center space-x-4">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-gray-600">Quantity: {quantity}</p>
                        </div>
                        <p className="font-medium">${(product.price * quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    loading={loading}
                    className="flex-1"
                    size="lg"
                  >
                    Place Order
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
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

              {/* Order Items Summary */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">Items ({items.reduce((total, item) => total + item.quantity, 0)})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cartProducts.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{product.name} × {quantity}</span>
                      <span>${(product.price * quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;