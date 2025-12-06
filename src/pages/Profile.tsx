import React, { useState } from 'react';
import { User, MapPin, Package, Settings, Eye, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Order, Address } from '../types';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [orders] = useLocalStorage<Order[]>('orders', []);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [addressForm, setAddressForm] = useState<Address>({
    id: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  const userOrders = orders.filter(order => order.userId === user.id);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (profileForm.newPassword && profileForm.currentPassword !== user.password) {
      alert('Current password is incorrect');
      return;
    }

    const updateData: any = {
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
    };

    if (profileForm.newPassword) {
      updateData.password = profileForm.newPassword;
    }

    updateUser(updateData);
    setIsEditingProfile(false);
    setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    alert('Profile updated successfully!');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAddress: Address = {
      ...addressForm,
      id: crypto.randomUUID(),
    };

    updateUser({
      addresses: [...user.addresses, newAddress]
    });

    setAddressForm({
      id: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      isDefault: false,
    });
    setIsAddingAddress(false);
    alert('Address added successfully!');
  };

  const handleDeleteAddress = (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      updateUser({
        addresses: user.addresses.filter(addr => addr.id !== addressId)
      });
    }
  };

  const handlePrintReceipt = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Order Receipt - ${order.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .order-info { margin-bottom: 20px; }
              .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .items-table th { background-color: #f2f2f2; }
              .total { font-weight: bold; font-size: 18px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>EliteShop</h1>
              <h2>Order Receipt</h2>
            </div>
            
            <div class="order-info">
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Bank Transfer'}</p>
            </div>

            <div class="order-info">
              <h3>Shipping Address:</h3>
              <p>${order.shippingAddress.street}</p>
              <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
              <p>${order.shippingAddress.country}</p>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="order-info">
              <p><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
              <p><strong>Shipping:</strong> $${order.shippingFee.toFixed(2)}</p>
              <p class="total"><strong>Total: $${order.total.toFixed(2)}</strong></p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p>Thank you for your order!</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">Manage your profile, orders, and addresses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span>Profile Settings</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'orders' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Package className="h-5 w-5" />
                  <span>Order History</span>
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'addresses' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="h-5 w-5" />
                  <span>Addresses</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Profile Settings</h2>
                  <Button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    variant="outline"
                  >
                    {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium mb-4">Change Password</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={profileForm.currentPassword}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={profileForm.newPassword}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={profileForm.confirmPassword}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" size="lg">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <p className="text-gray-900">{user.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <p className="text-gray-900">{user.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Member Since
                        </label>
                        <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Order History */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Order History</h2>
                
                {userOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-gray-600 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <span className="font-semibold text-blue-600">${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Payment Method</p>
                            <p className="font-medium">
                              {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Bank Transfer'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Items</p>
                            <p className="font-medium">{order.items.length} item(s)</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={() => handlePrintReceipt(order)}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
                          >
                            <Download className="h-4 w-4" />
                            <span>Print Receipt</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Saved Addresses</h2>
                  <Button onClick={() => setIsAddingAddress(true)}>
                    Add New Address
                  </Button>
                </div>

                {user.addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No addresses saved</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-medium">{address.street}</p>
                            <p className="text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                            <p className="text-gray-600">{address.country}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                        {address.isDefault && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title="Order Details"
          maxWidth="lg"
        >
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-medium">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium">
                    {selectedOrder.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Bank Transfer'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Shipping Address</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${selectedOrder.shippingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handlePrintReceipt(selectedOrder)}>
                  Print Receipt
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Add Address Modal */}
        <Modal
          isOpen={isAddingAddress}
          onClose={() => setIsAddingAddress(false)}
          title="Add New Address"
        >
          <form onSubmit={handleAddAddress} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={addressForm.street}
                onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
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
                  value={addressForm.city}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
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
                  value={addressForm.state}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
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
                  value={addressForm.zipCode}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, zipCode: e.target.value }))}
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
                  value={addressForm.country}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="text-blue-600 mr-2"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Set as default address
              </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                onClick={() => setIsAddingAddress(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button type="submit">
                Add Address
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Profile;