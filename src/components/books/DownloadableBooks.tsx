
import React from 'react';
import { RentedBook } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { toast } from '@/lib/toast';

interface DownloadableBooksProps {
  books: RentedBook[];
}

const DownloadableBooks: React.FC<DownloadableBooksProps> = ({ books }) => {
  if (books.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Downloadable Books</CardTitle>
          <CardDescription>
            Books from your completed orders will appear here for download
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            You don't have any downloadable books yet.
            When your orders are marked as delivered, they'll appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleDownload = (book: RentedBook) => {
    // In a real application, this would download the actual book file
    // For this demo, we'll just show a success toast
    toast.success(`Download started for ${book.title}`);
    
    // Create a dummy PDF download (in a real app, this would be a real book file)
    const dummyPdfContent = `
      Title: ${book.title}
      Author: ${book.author}
      
      This is a sample book content for demonstration purposes.
      In a real application, this would be the actual e-book content.
    `;
    
    const blob = new Blob([dummyPdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Downloadable Books</CardTitle>
        <CardDescription>
          Your delivered books are available for download
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {books.map((book, index) => (
            <Card key={`${book.bookId}-${index}`} className="overflow-hidden">
              <div className="w-full">
                <AspectRatio ratio={2/3}>
                  <img 
                    src={book.coverImage || '/placeholder.svg'} 
                    alt={book.title} 
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">{book.title}</h3>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleDownload(book)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadableBooks;
