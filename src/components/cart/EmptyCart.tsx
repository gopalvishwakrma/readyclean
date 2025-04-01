
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

const EmptyCart = () => {
  const navigate = useNavigate();
  
  return (
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
  );
};

export default EmptyCart;
