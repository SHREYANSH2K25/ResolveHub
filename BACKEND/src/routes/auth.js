// src/routes/auth.js
import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import crypto from "crypto";

import { User } from "../models/User.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../services/authService.js";

const router = express.Router();

/**
 * LOCAL AUTH
 */

// Register User
router.post("/register", async (req, res) => {
  const { name, email, password, role, phone, department } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Create new user instance
    user = new User({
      name,
      email,
      password: "", // will hash below
      role: role || "citizen",
      phone,
      department,
      provider: "local",
    });

    // Hash password
    user.password = await hashPassword(password);
    await user.save();

    const token = generateToken(user.id, user.role);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Local login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    if (!user.password) {
      return res.status(400).json({
        msg: "No local password for this user. Use social login or reset password.",
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const token = generateToken(user.id, user.role);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * SOCIAL AUTH
 */

// Helper: find or create social user
const findOrCreateSocialUser = async ({
  provider,
  providerId,
  displayName,
  emails,
  roleHint,
}) => {
  let user = await User.findOne({ provider, providerId });

  const email =
    emails && emails[0] && emails[0].value
      ? emails[0].value.toLowerCase()
      : null;

  if (!user && email) user = await User.findOne({ email });

  if (user) {
    if (!user.provider || user.provider !== provider || !user.providerId) {
      user.provider = provider;
      user.providerId = providerId;
      await user.save();
    }
    return user;
  }

  const randomPassword = crypto.randomBytes(16).toString("hex");
  const hashed = await hashPassword(randomPassword);

  const newUser = new User({
    name: displayName || (email ? email.split("@")[0] : "Unknown"),
    email: email || `no-email-${provider}-${providerId}@example.com`,
    password: hashed,
    role: roleHint || "citizen",
    provider,
    providerId,
  });

  await newUser.save();
  return newUser;
};

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateSocialUser({
          provider: "google",
          providerId: profile.id,
          displayName: profile.displayName,
          emails: profile.emails,
        });
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// Configure GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateSocialUser({
          provider: "github",
          providerId: profile.id,
          displayName: profile.displayName || profile.username,
          emails: profile.emails,
        });
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// serialize / deserialize for session
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user || null);
  } catch (err) {
    done(err, null);
  }
});

/**
 * SOCIAL ROUTES
 */

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/oauth-failure`,
    session: false,
  }),
  (req, res) => {
    const token = generateToken(req.user.id, req.user.role);
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
  }
);

// GitHub OAuth
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.FRONTEND_URL}/oauth-failure`,
    session: false,
  }),
  (req, res) => {
    const token = generateToken(req.user.id, req.user.role);
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
  }
);

export default router;
