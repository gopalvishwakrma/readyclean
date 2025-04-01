
import { db, collection, doc, getDoc, getDocs, updateDoc, query, where, addDoc, serverTimestamp, DEFAULT_CURRENCY } from "./firebase";
import { Order, RentedBook } from "../types";
import { toast } from "./toast";

// Fetch all orders (for admin)
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    console.log("Fetching all orders for admin panel");
    const ordersRef = collection(db, "orders");
    const snapshot = await getDocs(ordersRef);
    
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
    
    console.log(`Retrieved ${orders.length} orders from Firestore`);
    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    toast.error("Failed to fetch orders");
    return [];
  }
};

// Fetch orders for a specific user
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    console.log("Fetching orders for user:", userId);
    const q = query(collection(db, "orders"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
    
    console.log(`Found ${orders.length} orders for user ${userId}`);
    return orders;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    toast.error("Failed to fetch your orders");
    return [];
  }
};

// Get a specific order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    console.log("Getting order by ID:", orderId);
    if (!orderId) {
      console.error("Invalid order ID provided:", orderId);
      return null;
    }
    
    const orderDoc = await getDoc(doc(db, "orders", orderId));
    
    if (!orderDoc.exists()) {
      console.log("Order not found with ID:", orderId);
      return null;
    }
    
    const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order;
    console.log("Order data retrieved:", orderData);
    return orderData;
  } catch (error) {
    console.error("Error fetching order:", error);
    toast.error("Failed to fetch order details");
    return null;
  }
};

// Update order status (for admin)
export const updateOrderStatus = async (orderId: string, status: Order["status"]): Promise<boolean> => {
  try {
    console.log(`Updating order ${orderId} status to ${status}`);
    await updateDoc(doc(db, "orders", orderId), { 
      status,
      updatedAt: serverTimestamp()
    });
    
    toast.success(`Order status updated to ${status}`);
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    toast.error("Failed to update order status");
    return false;
  }
};

// Create a new order
export const createOrder = async (
  userId: string,
  userEmail: string,
  userName: string,
  books: RentedBook[],
  totalAmount: number,
  deliveryAddress: string,
  paymentDetails?: {
    paymentId: string;
    orderId: string;
    signature: string;
  }
): Promise<string | null> => {
  try {
    console.log("Creating new order with the following details:");
    console.log("User ID:", userId);
    console.log("User Email:", userEmail);
    console.log("User Name:", userName);
    console.log("Books:", JSON.stringify(books));
    console.log("Total Amount:", totalAmount);
    console.log("Delivery Address:", deliveryAddress);
    console.log("Payment Details:", paymentDetails);
    
    // Validate required fields
    if (!userId) {
      console.error("Missing required field: userId");
      throw new Error("User ID is required");
    }
    
    if (!books || books.length === 0) {
      console.error("Missing required field: books");
      throw new Error("No books selected");
    }
    
    // Create the order data with timestamp that will work in Firestore
    const orderData = {
      userId,
      userEmail,
      userName,
      books,
      totalAmount,
      status: "pending",
      deliveryAddress,
      paymentStatus: "completed",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      returnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Use ISO string for date
      paymentDetails: paymentDetails || null,
      currency: DEFAULT_CURRENCY // Use INR as the currency
    };
    
    console.log("Order data prepared:", orderData);
    
    // Add the document to Firestore
    const ordersCollection = collection(db, "orders");
    const orderRef = await addDoc(ordersCollection, orderData);
    
    if (!orderRef || !orderRef.id) {
      console.error("Failed to get order ID from Firebase");
      throw new Error("Failed to create order");
    }
    
    console.log("Order created with ID:", orderRef.id);
    toast.success("Order placed successfully!");
    return orderRef.id;
  } catch (error) {
    console.error("Error creating order:", error instanceof Error ? error.message : String(error));
    toast.error(`Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
};

// Get downloadable books (for completed orders)
export const getDownloadableBooks = async (userId: string): Promise<RentedBook[]> => {
  try {
    console.log("Fetching downloadable books for user:", userId);
    const q = query(
      collection(db, "orders"), 
      where("userId", "==", userId),
      where("status", "==", "delivered")
    );
    
    const snapshot = await getDocs(q);
    console.log(`Found ${snapshot.docs.length} delivered orders for user`);
    
    const downloadableBooks: RentedBook[] = [];
    
    snapshot.docs.forEach(doc => {
      const order = doc.data() as Order;
      order.books.forEach(book => {
        downloadableBooks.push({
          ...book,
          orderId: doc.id
        });
      });
    });
    
    console.log(`Total downloadable books: ${downloadableBooks.length}`);
    return downloadableBooks;
  } catch (error) {
    console.error("Error fetching downloadable books:", error);
    toast.error("Failed to fetch your downloadable books");
    return [];
  }
};
