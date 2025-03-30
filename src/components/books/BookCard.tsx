
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Book } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

interface BookCardProps {
  book: Book;
  showAddToCart?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ book, showAddToCart = true }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleViewDetails = () => {
    navigate(`/book/${book.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(book, 7); // Default rental period: 7 days
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
      onClick={handleViewDetails}
    >
      <div className="aspect-[2/3] overflow-hidden">
        <img 
          src={book.imageLinks.thumbnail || '/placeholder.svg'} 
          alt={book.title}
          className="w-full h-full object-cover book-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-sm line-clamp-1">{book.title}</h3>
        <p className="text-xs text-gray-500 line-clamp-1">
          {book.authors ? book.authors.join(', ') : 'Unknown Author'}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="font-semibold text-sm">${book.price}/week</p>
          {book.availability !== false && showAddToCart && (
            <Button 
              size="sm" 
              onClick={handleAddToCart}
              className="text-xs h-8"
            >
              Add to Cart
            </Button>
          )}
          {book.availability === false && (
            <span className="text-xs text-red-500">Unavailable</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCard;
