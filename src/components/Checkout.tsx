import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { db, Order, OrderItem } from '../lib/firebase';
import { collection, addDoc } from "firebase/firestore";
import { getCart, getCartTotal, clearCart } from '../lib/cart';
import { useAuth } from '../contexts/AuthContext';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginRequired: () => void;
}

export default function Checkout({ isOpen, onClose, onLoginRequired }: CheckoutProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [isAuthenticated, user]);

  if (!isOpen) return null;

  const cartItems = getCart();
  const total = getCartTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Please login to place an order');
      onLoginRequired();
      return;
    }

    setLoading(true);

    try {
      const orderNum = `AYU${Date.now()}`;

      const order: Order = {
        order_number: orderNum,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email,
        shipping_address: formData.address,
        total_amount: total,
        status: 'pending',
        payment_status: 'pending',
      };

      const docRef = await addDoc(collection(db, "orders"), order);

      const orderItems: OrderItem[] = cartItems.map((item) => ({
        order_id: docRef.id,
        product_id: item.product.id,
        variant_id: item.variant.id,
        quantity: item.quantity,
        unit_price: item.variant.price,
        subtotal: item.variant.price * item.quantity,
      }));

      for (const item of orderItems) {
        await addDoc(collection(db, `orders/${docRef.id}/items`), item);
      }

      setOrderNumber(orderNum);
      setOrderPlaced(true);
      clearCart();
      setLoading(false);
    } catch (error: any) {
      console.error('Error placing order:', error);
      alert(error.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOrderPlaced(false);
    setFormData({ name: '', phone: '', email: '', address: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {orderPlaced ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h3>
              <p className="text-gray-600 mb-4">Your order number is:</p>
              <p className="text-3xl font-bold text-[#9FC98D] mb-6">{orderNumber}</p>
              <p className="text-gray-600 mb-6">
                We'll contact you shortly on your provided phone number to confirm your order.
              </p>
              <button
                onClick={handleClose}
                className="bg-[#9FC98D] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#8BB87C] transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2 mb-4">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.product.id}-${item.variant.id}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-700">
                        {item.product.name} ({item.variant.weight}) x {item.quantity}
                      </span>
                      <span className="font-semibold text-gray-900">
                        ₹{(item.variant.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-[#9FC98D]">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FC98D] focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FC98D] focus:border-transparent"
                    placeholder="+91 9999999999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FC98D] focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Shipping Address *
                  </label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FC98D] focus:border-transparent"
                    placeholder="Enter complete delivery address"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#9FC98D] text-white py-3 rounded-lg font-semibold hover:bg-[#8BB87C] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By placing an order, you agree to our terms and conditions. We'll contact you to confirm payment details.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
