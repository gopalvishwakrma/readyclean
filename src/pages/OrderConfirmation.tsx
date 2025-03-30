
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const orderNumber = `BH-${Math.floor(100000 + Math.random() * 900000)}`;
  
  useEffect(() => {
    // This would typically check if an order was actually placed
    // For now, we'll just allow the page to be viewed
  }, []);

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
              <h2 className="text-xl font-semibold">Order #{orderNumber}</h2>
              <p className="text-gray-500 text-sm">
                Placed on {new Date().toLocaleDateString()}
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
                John Doe<br />
                123 Main Street<br />
                Anytown, CA 12345<br />
                United States
              </address>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Payment Method</h3>
              <p className="text-gray-700">
                Credit Card (ending in ****1234)
              </p>
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
              onClick={() => navigate('/')}
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
