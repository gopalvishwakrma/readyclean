import { toast } from "./toast";

export interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  imageLinks: {
    thumbnail: string;
    smallThumbnail: string;
  };
  categories?: string[];
  publishedDate?: string;
  publisher?: string;
  price: number;
  pageCount: number;
  averageRating?: number;
  language: string;
  availability?: boolean;
  isbn?: string;
}

export interface ApiBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    categories?: string[];
    imageLinks?: {
      thumbnail: string;
      smallThumbnail: string;
    };
    publishedDate?: string;
    publisher?: string;
    pageCount?: number;
    averageRating?: number;
    language?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

// Function to transform Google Books API response into our app's Book format
const transformBook = (book: ApiBook): Book => {
  const isbn = book.volumeInfo.industryIdentifiers?.find(
    id => id.type === "ISBN_13" || id.type === "ISBN_10"
  )?.identifier;

  return {
    id: book.id,
    title: book.volumeInfo.title || "Unknown Title",
    authors: book.volumeInfo.authors || ["Unknown Author"],
    description: book.volumeInfo.description || "No description available",
    imageLinks: book.volumeInfo.imageLinks || {
      thumbnail: "/placeholder.svg",
      smallThumbnail: "/placeholder.svg"
    },
    categories: book.volumeInfo.categories || ["Uncategorized"],
    publishedDate: book.volumeInfo.publishedDate,
    publisher: book.volumeInfo.publisher,
    price: Math.floor(Math.random() * 30) + 5, // Random price between $5-$35
    pageCount: book.volumeInfo.pageCount || 0,
    averageRating: book.volumeInfo.averageRating,
    language: book.volumeInfo.language || "en",
    availability: Math.random() > 0.2, // 80% of books are available
    isbn: isbn || undefined
  };
};

export const searchBooks = async (query: string, maxResults: number = 20): Promise<Book[]> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.items) {
      return [];
    }
    
    return data.items.map(transformBook);
  } catch (error) {
    console.error("Failed to fetch books:", error);
    toast.error("Failed to load books. Please try again.");
    return [];
  }
};

export const fetchBookById = async (id: string): Promise<Book | null> => {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const book = await response.json();
    return transformBook(book);
  } catch (error) {
    console.error(`Failed to fetch book with ID ${id}:`, error);
    toast.error("Failed to load book details");
    return null;
  }
};

export const fetchPopularBooks = async (): Promise<Book[]> => {
  // Use predefined popular topics to ensure we get quality results
  const popularTopics = [
    "fiction bestseller",
    "classic literature",
    "fantasy",
    "science fiction",
    "mystery thriller"
  ];
  
  const randomTopic = popularTopics[Math.floor(Math.random() * popularTopics.length)];
  return searchBooks(randomTopic, 12);
};

export const fetchBooksByCategory = async (category: string): Promise<Book[]> => {
  return searchBooks(`subject:${category}`, 15);
};
