
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Order } from '@/types';
import { getOrderById } from '@/lib/orderService';
import { toast } from '@/lib/toast';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get order ID from URL params
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('id');
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        console.error("No order ID provided in URL parameters");
        setError("Order information not found");
        toast.error("Order information not found");
        setLoading(false);
        return;
      }
      
      try {
        console.log("Fetching order with ID:", orderId);
        const orderData = await getOrderById(orderId);
        if (orderData) {
          console.log("Order data retrieved:", orderData);
          setOrder(orderData);
        } else {
          console.error("Order not found with ID:", orderId);
          setError("Order not found");
          toast.error("Order not found");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setError("Failed to load order details");
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <div className="text-center">
            <p className="text-lg">Loading order details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-red-500">{error || "Order information not found"}</p>
            <div className="flex justify-center mt-4 gap-4">
              <Button onClick={() => navigate('/cart')}>Return to Cart</Button>
              <Button onClick={() => navigate('/my-rentals')}>View My Rentals</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your order. Your books will be delivered soon.
          </p>
        </div>
        
        <div className="bg-white shadow-sm border rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold">Order #{order.id.substring(0, 8)}...</h2>
              <p className="text-gray-500 text-sm">
                Placed on {order.createdAt?.toDate 
                  ? new Date(order.createdAt.toDate()).toLocaleDateString() 
                  : new Date().toLocaleDateString()}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/my-rentals')}
            >
              View Order
            </Button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Estimated Delivery</h3>
              <p className="text-gray-700">
                {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Shipping Address</h3>
              <address className="text-gray-700 not-italic">
                {order.deliveryAddress || "No address provided"}
              </address>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Payment Method</h3>
              <p className="text-gray-700">
                Credit Card (ending in ****1234)
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Order Summary</h3>
              <div className="space-y-2">
                {order.books.map((book, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{book.title} ({book.rentalDays} days)</span>
                    <span>${book.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 font-bold flex justify-between">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-center text-gray-600">
            We've sent a confirmation email with all the details of your order.
            If you have any questions, please contact our customer service.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/books')}
            >
              Continue Shopping
            </Button>
            <Button onClick={() => navigate('/my-rentals')}>
              View My Rentals
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;
