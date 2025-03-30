
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface HeroProps {
  title: string;
  subtitle: string;
  showSearch?: boolean;
}

const Hero: React.FC<HeroProps> = ({ 
  title, 
  subtitle, 
  showSearch = true 
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-12 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          {subtitle}
        </p>
        
        {showSearch && (
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSearch} className="flex">
              <Input
                type="text"
                placeholder="Search for books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-r-none focus-visible:ring-0"
              />
              <Button type="submit" className="rounded-l-none">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
