// Book.ts - Book Module

export enum Status {
  Read = "Read",
  ReRead = "Re-read",
  DNF = "DNF",
  CurrentlyReading = "Currently reading",
  ReturnedUnread = "Returned Unread",
  WantToRead = "Want to read",
}

export enum Format {
  Print = "Print",
  PDF = "PDF",
  Ebook = "Ebook",
  AudioBook = "AudioBook",
}

export class Book {
  title: string;
  author: string;
  numberOfPages: number;
  status: Status;
  price: number;
  numberOfPagesRead: number;
  format: Format;
  suggestedBy: string;
  finished: boolean;

  constructor(
    title: string,
    author: string,
    numberOfPages: number,
    status: Status,
    price: number,
    numberOfPagesRead: number,
    format: Format,
    suggestedBy: string
  ) {
    this.title = title;
    this.author = author;
    this.numberOfPages = numberOfPages;
    this.status = status;
    this.price = price;
    this.numberOfPagesRead = numberOfPagesRead;
    this.format = format;
    this.suggestedBy = suggestedBy;
    // finished is automatically true when pages read equals total pages
    this.finished = numberOfPagesRead >= numberOfPages && numberOfPages > 0;
  }

  // Returns the reading percentage progress
  currentlyAt(): number {
    if (this.numberOfPages === 0) return 0;
    const percent = (this.numberOfPagesRead / this.numberOfPages) * 100;
    return Math.min(Math.round(percent * 10) / 10, 100);
  }

  // Marks the book for deletion (returns its title as confirmation)
  deleteBook(): string {
    return `Book "${this.title}" has been deleted.`;
  }
}