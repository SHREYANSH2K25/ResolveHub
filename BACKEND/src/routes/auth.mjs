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
 * Local register & login (existing)
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
      password: "", // will set hashed below
      role: role || "citizen",
      phone,
      department,
      provider: "local",
    });

    // Hash password
    user.password = await hashPassword(password);
    await user.save();

    // generate token and send it back
    const token = generateToken(user.id, user.role);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Login (local)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    // If user was created by social provider and has no password, reject local login
    if (!user.password) {
      return res.status(400).json({
        msg: "No local password for this user. Use social login (Google/GitHub) or reset password.",
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
 * Passport social strategies setup
 *
 * Note: The server must have session & passport.initialize() configured (done in server.js).
 */

// helper: find or create social user
const findOrCreateSocialUser = async ({
  provider,
  providerId,
  displayName,
  emails,
  roleHint,
}) => {
  // if providerId present, try find by providerId first
  let user = await User.findOne({ provider, providerId });

  // fallback: if not found, try to find by email (user may have registered with local account)
  const email =
    emails && emails[0] && emails[0].value
      ? emails[0].value.toLowerCase()
      : null;
  if (!user && email) {
    user = await User.findOne({ email });
  }

  if (user) {
    // update provider info if missing
    if (!user.provider || user.provider !== provider || !user.providerId) {
      user.provider = provider;
      user.providerId = providerId;
      await user.save();
    }
    return user;
  }

  // create new user
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
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL, // e.g. http://localhost:5000/api/auth/google/callback
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
} else {
  console.warn('Google OAuth not configured: set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_CALLBACK_URL to enable Google sign-in.');
}

// Configure GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_CALLBACK_URL) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL, // e.g. http://localhost:5000/api/auth/github/callback
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Note: profile.emails may be undefined if GitHub email is private. passport-github2 usually provides emails array if scope includes user:email
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
} else {
  console.warn('GitHub OAuth not configured: set GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET and GITHUB_CALLBACK_URL to enable GitHub sign-in.');
}

// serialize / deserialize - store user id in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user || null);
  } catch (err) {
    done(err, null);
  }
});

/**
 * Social auth routes
 *
 * Start endpoints:
 *  - GET /api/auth/google -> redirect to Google
 *  - GET /api/auth/google/callback -> Google redirects here
 *
 *  - GET /api/auth/github -> redirect to GitHub
 *  - GET /api/auth/github/callback -> GitHub redirects here
 *
 * On successful social auth, we create (or find) user, generate JWT and redirect to FRONTEND_URL with token in query.
 */

// Kick off Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/oauth-failure`,
    session: false,
  }),
  (req, res) => {
    // req.user is set by passport
    const user = req.user;
    const token = generateToken(user.id, user.role);
    // Redirect to frontend with token
    const redirectTo = `${process.env.FRONTEND_URL}/oauth-success?token=${token}`;
    res.redirect(redirectTo);
  }
);

// Kick off GitHub OAuth
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// GitHub callback
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.FRONTEND_URL}/oauth-failure`,
    session: false,
  }),
  (req, res) => {
    const user = req.user;
    const token = generateToken(user.id, user.role);
    const redirectTo = `${process.env.FRONTEND_URL}/oauth-success?token=${token}`;
    res.redirect(redirectTo);
  }
);

export default router;
