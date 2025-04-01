
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { fetchBookById, Book } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, ShoppingCart, IndianRupee } from 'lucide-react';
import { convertToINR, formatINR } from '@/lib/paymentService';

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [rentalDays, setRentalDays] = useState('7');

  useEffect(() => {
    const loadBook = async () => {
      if (!id) return;
      
      try {
        const bookData = await fetchBookById(id);
        setBook(bookData);
      } catch (error) {
        console.error('Error loading book details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadBook();
  }, [id]);

  const handleAddToCart = () => {
    if (!book) return;
    
    addToCart(book, parseInt(rentalDays));
  };

  const handleRentNow = () => {
    if (!book) return;
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    addToCart(book, parseInt(rentalDays));
    navigate('/cart');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            </div>
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex space-x-4 pt-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Book not found</h1>
          <p className="mb-8">The book you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate('/books')}>Browse Books</Button>
        </div>
      </Layout>
    );
  }
  
  // Calculate INR price
  const inrPricePerWeek = convertToINR(book.price);
  const totalInrPrice = inrPricePerWeek * parseInt(rentalDays) / 7;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-8"
        >
          ← Back
        </Button>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Book Cover */}
          <div>
            <img 
              src={book.imageLinks.thumbnail || '/placeholder.svg'} 
              alt={book.title}
              className="w-full rounded-lg shadow-md object-cover"
            />
          </div>
          
          {/* Book Details */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-lg text-gray-600 mb-4">
              by {book.authors ? book.authors.join(', ') : 'Unknown Author'}
            </p>
            
            <div className="flex items-center mb-6">
              {book.averageRating && (
                <div className="flex items-center mr-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star 
                      key={index} 
                      className={`h-4 w-4 ${
                        index < Math.floor(book.averageRating || 0) 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                  <span className="ml-2 text-sm">{book.averageRating}</span>
                </div>
              )}
              
              {book.pageCount > 0 && (
                <span className="text-sm text-gray-500">
                  {book.pageCount} pages
                </span>
              )}
            </div>
            
            <div className="mb-8">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{book.description}</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Rental Details</CardTitle>
                <CardDescription>Choose your rental period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Rental Period</p>
                    <Select 
                      value={rentalDays} 
                      onValueChange={setRentalDays}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="21">21 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="text-2xl font-bold flex items-center">
                      <IndianRupee className="h-5 w-5 mr-1" />
                      {formatINR(totalInrPrice).replace("₹", "")}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center">
                      (<IndianRupee className="h-3 w-3 mr-1" />{formatINR(inrPricePerWeek).replace("₹", "")}/week × {parseInt(rentalDays)/7} weeks)
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="text-sm font-medium">Publisher:</p>
                    <p className="text-sm text-gray-600">{book.publisher || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Published Date:</p>
                    <p className="text-sm text-gray-600">{book.publishedDate || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Categories:</p>
                    <p className="text-sm text-gray-600">
                      {book.categories ? book.categories.join(', ') : 'Uncategorized'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Language:</p>
                    <p className="text-sm text-gray-600">
                      {book.language === 'en' ? 'English' : book.language}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleAddToCart} 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  disabled={book.availability === false}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button 
                  onClick={handleRentNow} 
                  className="w-full sm:w-auto"
                  disabled={book.availability === false}
                >
                  Rent Now
                </Button>
              </CardFooter>
            </Card>
            
            {book.availability === false && (
              <p className="text-red-500 mt-4 text-center">
                This book is currently unavailable for rental
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookDetail;
