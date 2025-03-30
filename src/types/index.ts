
import { Book } from "../lib/api";

export interface User {
  uid: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  role: "user" | "admin";
  createdAt?: any;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  books: RentedBook[];
  totalAmount: number;
  status: "pending" | "confirmed" | "delivered" | "returned" | "cancelled";
  deliveryAddress: string;
  paymentStatus: "pending" | "completed" | "failed";
  createdAt: any;
  returnDate: any;
}

export interface RentedBook {
  bookId: string;
  title: string;
  author: string;
  coverImage: string;
  price: number;
  rentalDays: number;
  totalPrice: number;
  orderId?: string; // Added optional orderId property
}

export interface CartItem {
  book: Book;
  rentalDays: number;
}
