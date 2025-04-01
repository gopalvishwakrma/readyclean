
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ShippingInfo } from './ShippingForm';

interface ShippingSummaryProps {
  shippingInfo: ShippingInfo;
}

const ShippingSummary = ({ shippingInfo }: ShippingSummaryProps) => {
  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-2">📍</div>
            <div>
              <p className="font-medium text-sm">Shipping Address</p>
              <p className="text-xs text-gray-500">
                {shippingInfo.fullName}<br />
                {shippingInfo.address}<br />
                {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br />
                {shippingInfo.country}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShippingSummary;
