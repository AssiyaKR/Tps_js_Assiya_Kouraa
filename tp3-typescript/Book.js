"use strict";
// Book.ts - Book Module
Object.defineProperty(exports, "__esModule", { value: true });
exports.Book = exports.Format = exports.Status = void 0;
var Status;
(function (Status) {
    Status["Read"] = "Read";
    Status["ReRead"] = "Re-read";
    Status["DNF"] = "DNF";
    Status["CurrentlyReading"] = "Currently reading";
    Status["ReturnedUnread"] = "Returned Unread";
    Status["WantToRead"] = "Want to read";
})(Status || (exports.Status = Status = {}));
var Format;
(function (Format) {
    Format["Print"] = "Print";
    Format["PDF"] = "PDF";
    Format["Ebook"] = "Ebook";
    Format["AudioBook"] = "AudioBook";
})(Format || (exports.Format = Format = {}));
class Book {
    title;
    author;
    numberOfPages;
    status;
    price;
    numberOfPagesRead;
    format;
    suggestedBy;
    finished;
    constructor(title, author, numberOfPages, status, price, numberOfPagesRead, format, suggestedBy) {
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
    currentlyAt() {
        if (this.numberOfPages === 0)
            return 0;
        const percent = (this.numberOfPagesRead / this.numberOfPages) * 100;
        return Math.min(Math.round(percent * 10) / 10, 100);
    }
    // Marks the book for deletion (returns its title as confirmation)
    deleteBook() {
        return `Book "${this.title}" has been deleted.`;
    }
}
exports.Book = Book;
//# sourceMappingURL=Book.js.map