import React from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Bell,
  Eye,
  Calendar
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { User, Product, Order, ContactMessage } from '../../types';

const AdminDashboard: React.FC = () => {
  const [users] = useLocalStorage<User[]>('users', []);
  const [products] = useLocalStorage<Product[]>('products', []);
  const [orders] = useLocalStorage<Order[]>('orders', []);
  const [contactMessages] = useLocalStorage<ContactMessage[]>('contactMessages', []);

  const totalUsers = users.filter(user => !user.isAdmin).length;
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const unreadMessages = contactMessages.filter(msg => !msg.isRead).length;
  
  const totalRevenue = orders
    .filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total, 0);

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const lowStockProducts = products.filter(product => product.stock < 10);

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: 'bg-blue-500',
      change: '+8.2%',
      changeType: 'positive'
    },
    {
      title: 'Total Products',
      value: totalProducts.toString(),
      icon: Package,
      color: 'bg-purple-500',
      change: '+3.1%',
      changeType: 'positive'
    },
    {
      title: 'Total Users',
      value: totalUsers.toString(),
      icon: Users,
      color: 'bg-orange-500',
      change: '+15.3%',
      changeType: 'positive'
    }
  ];

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-600" />
            {(pendingOrders > 0 || unreadMessages > 0) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingOrders + unreadMessages}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{stat.change}</span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(pendingOrders > 0 || unreadMessages > 0 || lowStockProducts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {pendingOrders > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingCart className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Pending Orders
                  </h3>
                  <p className="text-sm text-yellow-700">
                    You have {pendingOrders} pending order{pendingOrders !== 1 ? 's' : ''} to process.
                  </p>
                </div>
              </div>
            </div>
          )}

          {unreadMessages > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Unread Messages
                  </h3>
                  <p className="text-sm text-blue-700">
                    You have {unreadMessages} unread message{unreadMessages !== 1 ? 's' : ''}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {lowStockProducts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Low Stock Alert
                  </h3>
                  <p className="text-sm text-red-700">
                    {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} running low on stock.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">#{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Low Stock Products</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {lowStockProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">All products are well stocked</p>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">${product.price}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.stock} left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Package className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Add Product</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">View Orders</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Manage Users</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;