
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';

interface PaymentSectionProps {
  isProcessing: boolean;
  processingError: string | null;
  onBack: () => void;
  onProceed: () => void;
}

const PaymentSection = ({ 
  isProcessing, 
  processingError, 
  onBack, 
  onProceed 
}: PaymentSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Your payment will be processed securely via Razorpay
        </CardDescription>
      </CardHeader>
      <CardContent>
        {processingError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
            {processingError}
          </div>
        )}
        
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded mb-4">
          <p className="text-sm">
            <strong>Test Card Information:</strong><br />
            Card Number: 4111 1111 1111 1111<br />
            Expiry: Any future date<br />
            CVV: Any 3 digits<br />
            Name: Any name<br />
          </p>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={onBack}
            disabled={isProcessing}
          >
            Back to Shipping
          </Button>
          <Button 
            type="button" 
            onClick={onProceed} 
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSection;
