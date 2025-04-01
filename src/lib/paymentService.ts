
import { toast } from "./toast";
import { IndianRupee } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Razorpay credentials
const RAZORPAY_KEY_ID = "rzp_test_y2F84038a9FYwq";

// Load the Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Razorpay script failed to load");
      toast.error("Payment gateway failed to load");
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};

// Create payment instance and open checkout
export const initiateRazorpayPayment = (
  orderId: string,
  amount: number, 
  userEmail: string,
  userName: string,
  onSuccess: (paymentId: string, orderId: string, signature: string) => void,
  onFailure: (error: any) => void
): void => {
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: Math.round(amount * 100), // Amount in smallest currency unit (paise for INR)
    currency: "INR",
    name: "BookHaven",
    description: "Book Rental Payment",
    image: "/placeholder.svg", // Your logo
    order_id: orderId, // This is optional for client-side generated orders
    handler: function (response: any) {
      console.log("Payment successful:", response);
      // Call success callback with payment details
      onSuccess(
        response.razorpay_payment_id || "client-generated",
        response.razorpay_order_id || orderId,
        response.razorpay_signature || "client-generated"
      );
    },
    prefill: {
      name: userName,
      email: userEmail,
      contact: "", // You can add phone number here if available
    },
    notes: {
      order_id: orderId,
    },
    theme: {
      color: "#4945FF",
    },
    modal: {
      ondismiss: function() {
        console.log("Payment modal closed without completing payment");
        toast.error("Payment cancelled");
      }
    }
  };

  try {
    console.log("Creating Razorpay instance with options:", options);
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error("Error in Razorpay initialization:", error);
    onFailure(error);
  }
};

// Exchange rate: 1 USD = 83 INR (approx)
// This would ideally come from an API but for demonstration using a fixed rate
export const USD_TO_INR_RATE = 83;

// Helper function to convert USD to INR
export const convertToINR = (usdPrice: number): number => {
  return Math.round(usdPrice * USD_TO_INR_RATE);
};

// Format INR price with ₹ symbol
export const formatINR = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};
