
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  ShoppingBag, 
  Package, 
  CalendarClock, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

// Simulated rental orders data
const dummyOrders = [
  {
    id: 'ORD001',
    status: 'pending',
    books: [
      {
        id: 'book1',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        cover: 'https://covers.openlibrary.org/b/id/8424385-M.jpg',
        rentalDays: 14,
      },
      {
        id: 'book2',
        title: '1984',
        author: 'George Orwell',
        cover: 'https://covers.openlibrary.org/b/id/8575111-M.jpg',
        rentalDays: 7,
      }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    totalAmount: 42.50,
  },
  {
    id: 'ORD002',
    status: 'delivered',
    books: [
      {
        id: 'book3',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        cover: 'https://covers.openlibrary.org/b/id/12000150-M.jpg',
        rentalDays: 21,
      }
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    totalAmount: 28.75,
    deliveredAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    returnDue: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'ORD003',
    status: 'returned',
    books: [
      {
        id: 'book4',
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        cover: 'https://covers.openlibrary.org/b/id/12003830-M.jpg',
        rentalDays: 14,
      },
      {
        id: 'book5',
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        cover: 'https://covers.openlibrary.org/b/id/12547271-M.jpg',
        rentalDays: 14,
      }
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    totalAmount: 35.20,
    deliveredAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    returnedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'ORD004',
    status: 'cancelled',
    books: [
      {
        id: 'book6',
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        cover: 'https://covers.openlibrary.org/b/id/6853974-M.jpg',
        rentalDays: 7,
      }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    totalAmount: 15.99,
    cancelledAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  }
];

const MyRentals = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([...dummyOrders]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would typically fetch the user's orders from the database
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setOrders([...dummyOrders]);
      setLoading(false);
    }, 1000);
  }, [currentUser, navigate]);

  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders;
    return orders.filter(order => order.status === activeTab);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ShoppingBag className="text-amber-500" />;
      case 'delivered':
        return <Package className="text-green-500" />;
      case 'returned':
        return <CheckCircle2 className="text-blue-500" />;
      case 'cancelled':
        return <XCircle className="text-red-500" />;
      default:
        return <ShoppingBag className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Processing';
      case 'delivered':
        return 'Active Rental';
      case 'returned':
        return 'Returned';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6">My Rentals</h1>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Processing</TabsTrigger>
            <TabsTrigger value="delivered">Active Rentals</TabsTrigger>
            <TabsTrigger value="returned">Returned</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-6">
            {loading ? (
              <p className="text-center py-12">Loading your orders...</p>
            ) : getFilteredOrders().length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No orders found</h2>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'all' 
                    ? "You haven't placed any orders yet." 
                    : `You don't have any ${activeTab} orders.`}
                </p>
                <Button onClick={() => navigate('/books')}>
                  Browse Books
                </Button>
              </div>
            ) : (
              getFilteredOrders().map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <CardDescription>
                          Placed on {order.createdAt.toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center mt-2 sm:mt-0">
                        {getStatusIcon(order.status)}
                        <span className="ml-2 font-medium">
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {order.books.map((book) => (
                        <div key={book.id} className="flex">
                          <div className="h-24 w-16 flex-shrink-0">
                            <img 
                              src={book.cover} 
                              alt={book.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium">{book.title}</h3>
                            <p className="text-sm text-gray-500">{book.author}</p>
                            <p className="text-sm mt-1">
                              Rental period: {book.rentalDays} days
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {order.status === 'delivered' && (
                      <div className="mt-6 bg-blue-50 p-4 rounded-md flex items-start">
                        <CalendarClock className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium">Return by {order.returnDue.toLocaleDateString()}</p>
                          <p className="text-xs text-gray-600">
                            Please return your books by the due date to avoid additional charges
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 flex justify-between">
                    <div>
                      <p className="text-sm font-medium">Total: ${order.totalAmount.toFixed(2)}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyRentals;
