const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("./config/passport");
const connectDB = require("./config/db");
const path = require("path");

const app = express();
const PORT = 3000;
const MONGO_URI = "mongodb://127.0.0.1:27017/tp2_books";
const SESSION_SECRET = "super_secret_key_tp2";

connectDB(MONGO_URI);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", require("./routes/auth"));
app.use("/books", require("./routes/books"));

app.get("/", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/books");
  res.redirect("/auth/login");
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});