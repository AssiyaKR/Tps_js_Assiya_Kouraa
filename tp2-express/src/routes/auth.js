const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");

router.get("/register", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/books");
  res.render("register", { error: null });
});

router.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render("register", { error: "Les mots de passe ne correspondent pas" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.render("register", { error: "Nom d'utilisateur ou email déjà utilisé" });
    }

    const user = await User.create({ username, email, password });

    req.login(user, (err) => {
      if (err) return next(err);
      res.redirect("/books");
    });
  } catch (err) {
    console.error(err);
    res.render("register", { error: "Erreur serveur, réessaie plus tard" });
  }
});

router.get("/login", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/books");
  res.render("login", { error: null });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.render("login", { error: info.message || "Identifiants incorrects" });
    }
    req.login(user, (err) => {
      if (err) return next(err);
      res.redirect("/books");
    });
  })(req, res, next);
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/auth/login");
  });
});

module.exports = router;