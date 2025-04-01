
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { IndianRupee } from 'lucide-react';
import { formatINR } from '@/lib/paymentService';
import { CartItem } from '@/types';

interface OrderSummaryProps {
  items: CartItem[];
  totalAmount: number;
  showCheckoutButton?: boolean;
  onCheckout?: () => void;
  buttonText?: string;
}

const OrderSummary = ({ 
  items, 
  totalAmount, 
  showCheckoutButton = false,
  onCheckout,
  buttonText = "Proceed to Checkout"
}: OrderSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items && items.length > 0 && (
            <div className="text-sm space-y-1">
              {items.map((item) => (
                <div key={item.book.id} className="flex justify-between">
                  <span className="truncate max-w-[180px]">
                    {item.book.title} ({item.rentalDays} days)
                  </span>
                  <span className="flex items-center">
                    <IndianRupee className="h-3 w-3 mr-1" />
                    {formatINR(item.book.price * item.rentalDays / 7).replace("₹", "")}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className={items && items.length > 0 ? "border-t pt-4 space-y-2" : "space-y-2"}>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="flex items-center">
                <IndianRupee className="h-3 w-3 mr-1" />
                {formatINR(totalAmount).replace("₹", "")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between border-t pt-4">
              <span className="font-bold">Total</span>
              <span className="font-bold flex items-center">
                <IndianRupee className="h-3 w-3 mr-1" />
                {formatINR(totalAmount).replace("₹", "")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      {showCheckoutButton && onCheckout && (
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={onCheckout}
          >
            {buttonText}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default OrderSummary;
