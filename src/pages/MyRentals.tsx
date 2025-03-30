
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { getUserOrders, getDownloadableBooks } from '../lib/orderService';
import { Order, RentedBook } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, Calendar, Clock } from 'lucide-react';
import { toast } from '../lib/toast';
import DownloadableBooks from '../components/books/DownloadableBooks';

const MyRentals = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [downloadableBooks, setDownloadableBooks] = useState<RentedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const userOrders = await getUserOrders(currentUser.uid);
        setOrders(userOrders);
        
        // Fetch downloadable books
        const dlBooks = await getDownloadableBooks(currentUser.uid);
        setDownloadableBooks(dlBooks);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load your orders");
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      if (!currentUser) {
        navigate('/login');
      } else {
        fetchUserOrders();
      }
    }
  }, [currentUser, loading, navigate]);

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'returned':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    
    if (date.toDate) {
      // Firebase Timestamp
      return new Date(date.toDate()).toLocaleDateString();
    }
    
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    
    return new Date(date).toLocaleDateString();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Rentals</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <p className="text-lg text-gray-600">Loading your orders...</p>
          </div>
        ) : (
          <>
            {/* Downloadable Books Section */}
            <DownloadableBooks books={downloadableBooks} />
            
            {/* Order History */}
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View all your past and current book rentals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-4">You haven't rented any books yet</p>
                    <Button onClick={() => navigate('/books')}>
                      Browse Books
                    </Button>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {orders.map((order, index) => (
                      <AccordionItem key={order.id} value={order.id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-2">
                            <div className="flex items-center">
                              <div className="mr-4">
                                <Package className="h-8 w-8 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium">Order #{order.id.substring(0, 8)}...</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                              <span className="font-medium">
                                ${order.totalAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-12 space-y-4">
                            <div className="grid gap-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4" />
                                <span>Return Date: {formatDate(order.returnDate)}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4" />
                                <span>
                                  Status: 
                                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </span>
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">Books in this order</h4>
                              <div className="grid gap-3">
                                {order.books.map((book, idx) => (
                                  <div key={idx} className="flex justify-between items-center border-b pb-2">
                                    <div className="flex items-center gap-3">
                                      <img 
                                        src={book.coverImage || "/placeholder.svg"} 
                                        alt={book.title} 
                                        className="w-10 h-14 object-cover rounded"
                                      />
                                      <div>
                                        <p className="font-medium">{book.title}</p>
                                        <p className="text-sm text-muted-foreground">{book.author}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium">${book.totalPrice.toFixed(2)}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {book.rentalDays} days @ ${book.price.toFixed(2)}/day
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mt-4 flex justify-between items-center">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Delivery Address:
                                </p>
                                <p className="text-sm">
                                  {order.deliveryAddress || "No delivery address provided"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="font-bold">${order.totalAmount.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default MyRentals;
