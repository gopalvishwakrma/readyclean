
import React from 'react';
import { Book } from '@/lib/api';
import BookCard from './BookCard';
import { Skeleton } from '@/components/ui/skeleton';

interface BookGridProps {
  books: Book[];
  loading?: boolean;
  showAddToCart?: boolean;
}

const BookGrid: React.FC<BookGridProps> = ({ 
  books, 
  loading = false,
  showAddToCart = true
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No books found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} showAddToCart={showAddToCart} />
      ))}
    </div>
  );
};

export default BookGrid;
