const express = require("express");
const router = express.Router();

const books = [
  { id: 1, title: "Clean Code", author: "Robert C. Martin", genre: "Informatique", year: 2008 },
  { id: 2, title: "The Pragmatic Programmer", author: "David Thomas & Andrew Hunt", genre: "Informatique", year: 1999 },
  { id: 3, title: "Design Patterns", author: "Gang of Four", genre: "Architecture", year: 1994 },
  { id: 4, title: "You Don't Know JS", author: "Kyle Simpson", genre: "JavaScript", year: 2015 },
  { id: 5, title: "Node.js Design Patterns", author: "Mario Casciaro", genre: "Node.js", year: 2020 },
  { id: 6, title: "MongoDB: The Definitive Guide", author: "Shannon Bradshaw", genre: "Base de données", year: 2019 },
];

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/auth/login");
};

router.get("/", isAuthenticated, (req, res) => {
  res.render("books", { books, user: req.user });
});

module.exports = router;