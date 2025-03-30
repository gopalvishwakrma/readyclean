
import { db, collection, doc, getDoc, getDocs, updateDoc, query, where, addDoc, serverTimestamp } from "./firebase";
import { Order, RentedBook } from "../types";
import { toast } from "./toast";

// Fetch all orders (for admin)
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, "orders");
    const snapshot = await getDocs(ordersRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error("Error fetching orders:", error);
    toast.error("Failed to fetch orders");
    return [];
  }
};

// Fetch orders for a specific user
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(collection(db, "orders"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error("Error fetching user orders:", error);
    toast.error("Failed to fetch your orders");
    return [];
  }
};

// Get a specific order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const orderDoc = await getDoc(doc(db, "orders", orderId));
    
    if (!orderDoc.exists()) {
      toast.error("Order not found");
      return null;
    }
    
    return { id: orderDoc.id, ...orderDoc.data() } as Order;
  } catch (error) {
    console.error("Error fetching order:", error);
    toast.error("Failed to fetch order details");
    return null;
  }
};

// Update order status (for admin)
export const updateOrderStatus = async (orderId: string, status: Order["status"]): Promise<boolean> => {
  try {
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
  deliveryAddress: string
): Promise<string | null> => {
  try {
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
      returnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days return date
    };
    
    const orderRef = await addDoc(collection(db, "orders"), orderData);
    toast.success("Order placed successfully!");
    return orderRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    toast.error("Failed to place order");
    return null;
  }
};

// Get downloadable books (for completed orders)
export const getDownloadableBooks = async (userId: string): Promise<RentedBook[]> => {
  try {
    const q = query(
      collection(db, "orders"), 
      where("userId", "==", userId),
      where("status", "==", "delivered")
    );
    
    const snapshot = await getDocs(q);
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
    
    return downloadableBooks;
  } catch (error) {
    console.error("Error fetching downloadable books:", error);
    toast.error("Failed to fetch your downloadable books");
    return [];
  }
};
