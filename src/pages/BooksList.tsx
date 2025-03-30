
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import BookGrid from '../components/books/BookGrid';
import Hero from '../components/ui/hero';
import { searchBooks, fetchBooksByCategory, Book } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categoryOptions = [
  { label: 'All Categories', value: 'all' },
  { label: 'Fiction', value: 'fiction' },
  { label: 'Science Fiction', value: 'science fiction' },
  { label: 'Fantasy', value: 'fantasy' },
  { label: 'Mystery', value: 'mystery' },
  { label: 'Romance', value: 'romance' },
  { label: 'Biography', value: 'biography' },
  { label: 'Self-Help', value: 'self-help' },
  { label: 'History', value: 'history' },
  { label: 'Business', value: 'business' },
  { label: 'Children', value: 'children' },
];

const BooksList = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'all';
  const initialQuery = queryParams.get('q') || '';

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filter, setFilter] = useState({
    sortBy: 'relevance',
  });

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      
      try {
        let results: Book[] = [];
        
        if (searchQuery) {
          results = await searchBooks(searchQuery, 40);
        } else if (category !== 'all') {
          results = await fetchBooksByCategory(category);
        } else {
          results = await searchBooks('popular books', 40);
        }
        
        // Apply sorting
        if (filter.sortBy === 'price-low') {
          results.sort((a, b) => a.price - b.price);
        } else if (filter.sortBy === 'price-high') {
          results.sort((a, b) => b.price - a.price);
        }
        
        setBooks(results);
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadBooks();
  }, [category, searchQuery, filter.sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update URL parameters for shareable links
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (category !== 'all') params.set('category', category);
    
    window.history.pushState(
      {}, 
      '', 
      `${window.location.pathname}?${params}`
    );
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    
    // Update URL
    const params = new URLSearchParams(location.search);
    if (value === 'all') {
      params.delete('category');
    } else {
      params.set('category', value);
    }
    
    window.history.pushState(
      {}, 
      '', 
      `${window.location.pathname}?${params}`
    );
  };

  const handleSortChange = (value: string) => {
    setFilter({
      ...filter,
      sortBy: value
    });
  };

  return (
    <Layout>
      <Hero 
        title={searchQuery ? `Search results for "${searchQuery}"` : "Browse Our Book Collection"}
        subtitle="Find your next favorite read from our extensive library"
        showSearch={false}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters sidebar */}
          <div className="lg:w-72 space-y-6">
            <div className="bg-white p-6 border rounded-lg shadow-sm">
              <h3 className="font-medium mb-4">Search & Filters</h3>
              
              <form onSubmit={handleSearch} className="mb-6">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Books</Label>
                  <div className="flex gap-2">
                    <Input
                      id="search"
                      placeholder="Book title, author..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit" size="icon">
                      🔍
                    </Button>
                  </div>
                </div>
              </form>
              
              <div className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Sort By</Label>
                  <Select value={filter.sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setSearchQuery('');
                      setCategory('all');
                      setFilter({ sortBy: 'relevance' });
                      window.history.pushState({}, '', window.location.pathname);
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {searchQuery 
                  ? `Results for "${searchQuery}"` 
                  : category !== 'all' 
                    ? `${category} Books`
                    : 'All Books'}
              </h2>
              <p className="text-gray-600">
                {loading ? 'Loading...' : `${books.length} books found`}
              </p>
            </div>
            
            <BookGrid books={books} loading={loading} />
            
            {!loading && books.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No books found matching your criteria.</p>
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setCategory('all');
                    window.history.pushState({}, '', window.location.pathname);
                  }}
                >
                  Reset Search
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BooksList;
