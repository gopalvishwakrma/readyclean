
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from '@/lib/toast';
import { v4 as uuidv4 } from 'uuid';
import { loadRazorpayScript, initiateRazorpayPayment } from '@/lib/paymentService';
import { createOrder } from '@/lib/orderService';

// Cart Components
import EmptyCart from '@/components/cart/EmptyCart';
import CartItemsList from '@/components/cart/CartItemsList';
import OrderSummary from '@/components/cart/OrderSummary';
import ShippingForm from '@/components/cart/ShippingForm';
import PaymentSection from '@/components/cart/PaymentSection';
import ShippingSummary from '@/components/cart/ShippingSummary';
import { ShippingInfo } from '@/components/cart/ShippingForm';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateRentalDays, clearCart, totalAmount } = useCart();
  const { currentUser } = useAuth();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment'>('cart');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: currentUser?.fullName || '',
    address: currentUser?.address || '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      toast.error('Please sign in to continue');
      navigate('/login');
      return;
    }
    setCheckoutStep('shipping');
  };

  const handleShippingSubmit = (updatedShippingInfo: ShippingInfo) => {
    setShippingInfo(updatedShippingInfo);
    setCheckoutStep('payment');
  };

  const handlePaymentSubmit = async () => {
    if (!currentUser) {
      toast.error('Please login to complete your purchase');
      navigate('/login');
      return;
    }
    
    try {
      setIsProcessing(true);
      setProcessingError(null);
      
      console.log("Starting order creation process...");
      
      // Format delivery address
      const formattedAddress = `${shippingInfo.fullName}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}, ${shippingInfo.country}`;
      
      // Convert cart items to rented books
      const rentedBooks = items.map(item => ({
        bookId: item.book.id,
        title: item.book.title,
        author: item.book.authors ? item.book.authors.join(', ') : 'Unknown Author',
        coverImage: item.book.imageLinks?.thumbnail || '/placeholder.svg',
        price: item.book.price,
        rentalDays: item.rentalDays,
        totalPrice: item.book.price * item.rentalDays / 7
      }));
      
      console.log("Rental books formatted:", rentedBooks);
      
      // Generate a client-side order ID
      const clientOrderId = uuidv4();
      
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway");
      }
      
      // Initialize Razorpay payment
      initiateRazorpayPayment(
        clientOrderId,
        totalAmount,
        currentUser.email || '',
        shippingInfo.fullName,
        async (paymentId, orderId, signature) => {
          console.log("Payment successful with payment ID:", paymentId);
          // After successful payment, create order in database
          try {
            const firestoreOrderId = await createOrder(
              currentUser.uid,
              currentUser.email || '',
              shippingInfo.fullName,
              rentedBooks,
              totalAmount,
              formattedAddress,
              {
                paymentId,
                orderId,
                signature
              }
            );
            
            if (firestoreOrderId) {
              console.log("Order created successfully with ID:", firestoreOrderId);
              toast.success('Order placed successfully!');
              clearCart();
              navigate(`/order-confirmation?id=${firestoreOrderId}`);
            } else {
              console.error("Failed to create order in database");
              setProcessingError("Payment successful but order creation failed. Please contact support.");
            }
          } catch (err) {
            console.error("Error creating order:", err);
            setProcessingError("Error saving order details. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        (error) => {
          console.error("Payment failed:", error);
          setProcessingError("Payment processing failed. Please try again.");
          toast.error('Payment failed');
          setIsProcessing(false);
        }
      );
    } catch (error) {
      console.error("Error processing payment:", error);
      setProcessingError(`Payment processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Payment processing failed');
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && checkoutStep === 'cart') {
    return (
      <Layout>
        <EmptyCart />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6">
          {checkoutStep === 'cart' ? 'Shopping Cart' : 
           checkoutStep === 'shipping' ? 'Shipping Information' : 'Payment Details'}
        </h1>
        
        {checkoutStep === 'cart' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <CartItemsList 
                items={items} 
                removeFromCart={removeFromCart} 
                updateRentalDays={updateRentalDays} 
              />
            </div>
            
            <div>
              <OrderSummary 
                items={items}
                totalAmount={totalAmount}
                showCheckoutButton={true}
                onCheckout={handleProceedToCheckout}
              />
            </div>
          </div>
        )}
        
        {checkoutStep === 'shipping' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <ShippingForm 
                initialValues={shippingInfo}
                onSubmit={handleShippingSubmit}
                onBack={() => setCheckoutStep('cart')}
              />
            </div>
            <div>
              <OrderSummary 
                items={items}
                totalAmount={totalAmount}
              />
            </div>
          </div>
        )}
        
        {checkoutStep === 'payment' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <PaymentSection 
                isProcessing={isProcessing}
                processingError={processingError}
                onBack={() => setCheckoutStep('shipping')}
                onProceed={handlePaymentSubmit}
              />
            </div>
            <div>
              <OrderSummary 
                items={items}
                totalAmount={totalAmount}
              />
              <ShippingSummary shippingInfo={shippingInfo} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
