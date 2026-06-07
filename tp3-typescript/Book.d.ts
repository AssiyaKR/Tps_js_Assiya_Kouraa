export declare enum Status {
    Read = "Read",
    ReRead = "Re-read",
    DNF = "DNF",
    CurrentlyReading = "Currently reading",
    ReturnedUnread = "Returned Unread",
    WantToRead = "Want to read"
}
export declare enum Format {
    Print = "Print",
    PDF = "PDF",
    Ebook = "Ebook",
    AudioBook = "AudioBook"
}
export declare class Book {
    title: string;
    author: string;
    numberOfPages: number;
    status: Status;
    price: number;
    numberOfPagesRead: number;
    format: Format;
    suggestedBy: string;
    finished: boolean;
    constructor(title: string, author: string, numberOfPages: number, status: Status, price: number, numberOfPagesRead: number, format: Format, suggestedBy: string);
    currentlyAt(): number;
    deleteBook(): string;
}
//# sourceMappingURL=Book.d.ts.map