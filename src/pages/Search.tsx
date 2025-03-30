
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import BookGrid from '../components/books/BookGrid';
import { searchBooks, Book } from '../lib/api';
import { Button } from '@/components/ui/button';

const Search = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';
  
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  useEffect(() => {
    const searchForBooks = async () => {
      if (!query) return;
      
      setLoading(true);
      setBooks([]);
      setPage(1);
      
      try {
        const results = await searchBooks(query, 20);
        setBooks(results);
        setHasMore(results.length === 20);
      } catch (error) {
        console.error('Error searching for books:', error);
      } finally {
        setLoading(false);
      }
    };
    
    searchForBooks();
  }, [query]);
  
  const loadMore = async () => {
    if (loading || !hasMore || !query) return;
    
    setLoading(true);
    
    try {
      const nextPage = page + 1;
      const additionalBooks = await searchBooks(`${query}&page=${nextPage}`, 20);
      
      if (additionalBooks.length > 0) {
        setBooks([...books, ...additionalBooks]);
        setPage(nextPage);
        setHasMore(additionalBooks.length === 20);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more books:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-2">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-600 mb-6">
          {books.length} books found
        </p>
        
        <BookGrid books={books} loading={loading && page === 1} />
        
        {!loading && books.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              No books found matching your search term.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        )}
        
        {hasMore && (
          <div className="text-center mt-8">
            <Button 
              onClick={loadMore} 
              disabled={loading}
              variant="outline"
            >
              {loading && page > 1 ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
