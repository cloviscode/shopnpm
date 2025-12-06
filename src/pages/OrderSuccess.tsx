import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Order } from '../types';
import Button from '../components/UI/Button';

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [orders] = useLocalStorage<Order[]>('orders', []);
  
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const handlePrintReceipt = () => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600">Thank you for your purchase. Your order has been received and is being processed.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-semibold">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold">
                  {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Bank Transfer'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-semibold text-blue-600">${order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="text-left mb-6">
            <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          <div className="text-left mb-8">
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handlePrintReceipt}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Print Receipt
            </Button>
            <Link to="/profile">
              <Button className="flex items-center gap-2">
                View Order History
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-4">
              You will receive an email confirmation shortly. You can track your order status in your profile.
            </p>
            <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;