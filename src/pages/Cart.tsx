import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { toast } from '@/lib/toast';
import { createOrder } from '@/lib/orderService';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateRentalDays, clearCart, totalAmount } = useCart();
  const { currentUser } = useAuth();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment'>('cart');
  const [shippingInfo, setShippingInfo] = useState({
    fullName: currentUser?.fullName || '',
    address: currentUser?.address || '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentInfo({
      ...paymentInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city || 
        !shippingInfo.state || !shippingInfo.zipCode) {
      toast.error('Please fill in all required shipping fields');
      return;
    }
    
    setCheckoutStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentInfo.cardName || !paymentInfo.cardNumber || 
        !paymentInfo.expiryDate || !paymentInfo.cvv) {
      toast.error('Please fill in all payment details');
      return;
    }

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
      
      // Create order in Firebase
      const orderId = await createOrder(
        currentUser.uid,
        currentUser.email || '',
        shippingInfo.fullName,
        rentedBooks,
        totalAmount,
        formattedAddress
      );
      
      console.log("Order creation result:", orderId);
      
      if (orderId) {
        console.log("Order placed successfully with ID:", orderId);
        toast.success('Order placed successfully!');
        clearCart();
        // Redirect to order confirmation with order ID
        navigate(`/order-confirmation?id=${orderId}`);
      } else {
        console.error("Failed to create order - no order ID returned");
        setProcessingError("Failed to create your order. Please try again.");
        toast.error('Failed to create order');
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setProcessingError("Payment processing failed. Please try again.");
      toast.error('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      toast.error('Please sign in to continue');
      navigate('/login');
      return;
    }
    setCheckoutStep('shipping');
  };

  if (items.length === 0 && checkoutStep === 'cart') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any books to your cart yet.
            </p>
            <Button onClick={() => navigate('/books')}>
              Browse Books
            </Button>
          </div>
        </div>
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
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div 
                        key={item.book.id} 
                        className="flex items-start border-b pb-4"
                      >
                        <div className="h-20 w-14 flex-shrink-0">
                          <img 
                            src={item.book.imageLinks.thumbnail || '/placeholder.svg'} 
                            alt={item.book.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        
                        <div className="ml-4 flex-grow">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium text-sm">{item.book.title}</h3>
                              <p className="text-xs text-gray-500">
                                {item.book.authors ? item.book.authors.join(', ') : 'Unknown Author'}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeFromCart(item.book.id)}
                              className="h-8 w-8 text-gray-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center">
                              <span className="text-xs mr-2">Rental period:</span>
                              <Select 
                                value={item.rentalDays.toString()} 
                                onValueChange={(value) => updateRentalDays(item.book.id, parseInt(value))}
                              >
                                <SelectTrigger className="w-24 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="7">7 days</SelectItem>
                                  <SelectItem value="14">14 days</SelectItem>
                                  <SelectItem value="21">21 days</SelectItem>
                                  <SelectItem value="30">30 days</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="text-sm font-medium">
                              ${(item.book.price * item.rentalDays / 7).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between border-t pt-4">
                      <span className="font-bold">Total</span>
                      <span className="font-bold">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={handleProceedToCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
        
        {checkoutStep === 'shipping' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                  <CardDescription>
                    Enter the address where you want your books delivered
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={shippingInfo.fullName}
                          onChange={handleShippingInfoChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingInfoChange}
                        required
                      />
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleShippingInfoChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          name="state"
                          value={shippingInfo.state}
                          onChange={handleShippingInfoChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={shippingInfo.zipCode}
                          onChange={handleShippingInfoChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select 
                          value={shippingInfo.country} 
                          onValueChange={(value) => setShippingInfo({...shippingInfo, country: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="United States">United States</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                            {/* Add more countries as needed */}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setCheckoutStep('cart')}
                      >
                        Back to Cart
                      </Button>
                      <Button type="submit">
                        Continue to Payment
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm space-y-1">
                      {items.map((item) => (
                        <div key={item.book.id} className="flex justify-between">
                          <span className="truncate max-w-[180px]">
                            {item.book.title} ({item.rentalDays} days)
                          </span>
                          <span>${(item.book.price * item.rentalDays / 7).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between border-t pt-4">
                        <span className="font-bold">Total</span>
                        <span className="font-bold">${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {checkoutStep === 'payment' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>
                    Enter your payment information to complete your order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input
                        id="cardName"
                        name="cardName"
                        value={paymentInfo.cardName}
                        onChange={handlePaymentInfoChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={handlePaymentInfoChange}
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          value={paymentInfo.expiryDate}
                          onChange={handlePaymentInfoChange}
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          value={paymentInfo.cvv}
                          onChange={handlePaymentInfoChange}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                    
                    {processingError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
                        {processingError}
                      </div>
                    )}
                    
                    <div className="flex items-center mt-2">
                      <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-xs text-gray-500">
                        Your payment info is secure and will not be stored on our servers
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setCheckoutStep('shipping')}
                        disabled={isProcessing}
                      >
                        Back to Shipping
                      </Button>
                      <Button type="submit" disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Place Order'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm space-y-1">
                      {items.map((item) => (
                        <div key={item.book.id} className="flex justify-between">
                          <span className="truncate max-w-[180px]">
                            {item.book.title} ({item.rentalDays} days)
                          </span>
                          <span>${(item.book.price * item.rentalDays / 7).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between border-t pt-4">
                        <span className="font-bold">Total</span>
                        <span className="font-bold">${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-2">📍</div>
                      <div>
                        <p className="font-medium text-sm">Shipping Address</p>
                        <p className="text-xs text-gray-500">
                          {shippingInfo.fullName}<br />
                          {shippingInfo.address}<br />
                          {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br />
                          {shippingInfo.country}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
