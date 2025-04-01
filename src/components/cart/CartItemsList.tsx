
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, IndianRupee } from 'lucide-react';
import { CartItem } from '@/types';
import { formatINR } from '@/lib/paymentService';

interface CartItemsListProps {
  items: CartItem[];
  removeFromCart: (bookId: string) => void;
  updateRentalDays: (bookId: string, days: number) => void;
}

const CartItemsList = ({ items, removeFromCart, updateRentalDays }: CartItemsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cart Items ({items.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div 
              key={item.book.id} 
              className="flex items-start border-b pb-4"
            >
              <div className="h-20 w-14 flex-shrink-0">
                <img 
                  src={item.book.imageLinks.thumbnail || '/placeholder.svg'} 
                  alt={item.book.title}
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div className="ml-4 flex-grow">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{item.book.title}</h3>
                    <p className="text-xs text-gray-500">
                      {item.book.authors ? item.book.authors.join(', ') : 'Unknown Author'}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeFromCart(item.book.id)}
                    className="h-8 w-8 text-gray-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center">
                    <span className="text-xs mr-2">Rental period:</span>
                    <Select 
                      value={item.rentalDays.toString()} 
                      onValueChange={(value) => updateRentalDays(item.book.id, parseInt(value))}
                    >
                      <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="21">21 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm font-medium flex items-center">
                    <IndianRupee className="h-3 w-3 mr-1" />
                    {formatINR(item.book.price * item.rentalDays / 7).replace("₹", "")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItemsList;
