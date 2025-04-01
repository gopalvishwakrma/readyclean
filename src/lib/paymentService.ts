
import { toast } from "./toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
    key: "rzp_test_y2F84038a9FYwq", // Your Razorpay Key ID
    amount: amount * 100, // Amount in smallest currency unit (paise for INR)
    currency: "USD",
    name: "BookHaven",
    description: "Book Rental Payment",
    image: "/placeholder.svg", // Your logo
    order_id: orderId, // This is for server-generated orders (if applicable)
    handler: function (response: any) {
      console.log("Payment successful:", response);
      // Call success callback with payment details
      onSuccess(
        response.razorpay_payment_id,
        response.razorpay_order_id || orderId,
        response.razorpay_signature || "client-generated"
      );
    },
    prefill: {
      name: userName,
      email: userEmail,
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
