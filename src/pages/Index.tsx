
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Hero from '../components/ui/hero';
import BookGrid from '../components/books/BookGrid';
import { fetchPopularBooks, fetchBooksByCategory, Book } from '../lib/api';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const Index = () => {
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [fictionBooks, setFictionBooks] = useState<Book[]>([]);
  const [nonFictionBooks, setNonFictionBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState({
    popular: true,
    fiction: true,
    nonFiction: true,
  });

  useEffect(() => {
    const loadBooks = async () => {
      try {
        // Load popular books
        const popular = await fetchPopularBooks();
        setPopularBooks(popular);
        setLoading(prev => ({ ...prev, popular: false }));
        
        // Load fiction books
        const fiction = await fetchBooksByCategory('fiction');
        setFictionBooks(fiction);
        setLoading(prev => ({ ...prev, fiction: false }));
        
        // Load non-fiction books
        const nonFiction = await fetchBooksByCategory('biography');
        setNonFictionBooks(nonFiction);
        setLoading(prev => ({ ...prev, nonFiction: false }));
      } catch (error) {
        console.error('Error loading homepage books:', error);
        setLoading({
          popular: false,
          fiction: false,
          nonFiction: false,
        });
      }
    };
    
    loadBooks();
  }, []);

  const SectionHeader = ({ title, viewAllLink }: { title: string; viewAllLink: string }) => (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <Link to={viewAllLink}>
        <Button variant="ghost" className="text-bookhaven-600 hover:text-bookhaven-700 font-medium">
          View All <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );

  return (
    <Layout>
      <Hero 
        title="Discover Your Next Great Read"
        subtitle="Rent thousands of books without the commitment of purchasing. Just read, enjoy, and return!"
      />
      
      <div className="container mx-auto px-4 py-12">
        <section className="mb-16">
          <SectionHeader title="Popular Books" viewAllLink="/books" />
          <BookGrid books={popularBooks} loading={loading.popular} />
        </section>
        
        <section className="mb-16">
          <SectionHeader title="Fiction Books" viewAllLink="/books?category=fiction" />
          <BookGrid books={fictionBooks} loading={loading.fiction} />
        </section>
        
        <section className="mb-16">
          <SectionHeader title="Biography & Memoirs" viewAllLink="/books?category=biography" />
          <BookGrid books={nonFictionBooks} loading={loading.nonFiction} />
        </section>
        
        <section className="bg-bookhaven-50 rounded-lg p-8 mb-16">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">How BookHaven Works</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="bg-bookhaven-100 text-bookhaven-800 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 font-bold text-sm">1</span>
                  <div>
                    <p className="font-medium">Browse and Select Books</p>
                    <p className="text-sm text-gray-600">Search our extensive library and add books to your cart.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-bookhaven-100 text-bookhaven-800 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 font-bold text-sm">2</span>
                  <div>
                    <p className="font-medium">Choose Rental Period</p>
                    <p className="text-sm text-gray-600">Select how long you want to rent each book for.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-bookhaven-100 text-bookhaven-800 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 font-bold text-sm">3</span>
                  <div>
                    <p className="font-medium">Receive at Your Doorstep</p>
                    <p className="text-sm text-gray-600">We'll deliver the books right to your address.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-bookhaven-100 text-bookhaven-800 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 font-bold text-sm">4</span>
                  <div>
                    <p className="font-medium">Return When Done</p>
                    <p className="text-sm text-gray-600">Use our prepaid return shipping label when you're finished.</p>
                  </div>
                </li>
              </ul>
              <Button className="mt-6">Start Browsing</Button>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                alt="Person reading a book"
                className="rounded-lg shadow-md w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
