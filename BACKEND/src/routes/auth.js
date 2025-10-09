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
import {VerificationCode} from "../models/Verificationmodel.js"

const router = express.Router();

const getGlobalAdmin = async () => await User.findOne({ role: 'admin', city: 'Global' });

const getCitiesWithAdmin = async() => {
    const admins = await User.find({
        role : 'admin'
    }).select('city');
    return admins.map(a => a.city);
}

// Register User
router.post("/register", async (req, res) => {
    const { name, email, password, role : desiredRole, department, city, verificationcode } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });
        // Initialize default user data
        let finalRole = 'citizen'
        let finalCity = null
        let finalDepartment = null

        const citiesWithAdmin = await getCitiesWithAdmin()
        
        // prevent admin registeration
        if (desiredRole === 'admin') {
        return res
            .status(403)
            .json({ msg: 'Admin cannot register via this endpoint. Contact system administrator.' })
        }
        
        if(desiredRole === 'staff'){
            if (!city || !department) {
                return res.status(400).json({ msg: 'City and Department are required for registration.' })
            }

            if(!citiesWithAdmin.map(c => c.toLowerCase()).includes(city.toLowerCase())){
                return res
                    .status(403)
                    .json({msg: `Staff registration for ${city} is not available as no admin exists yet`})
            }

            const validCode = await VerificationCode.findOne({
                code : verificationcode, used:false, city
            })
            if (!validCode || !validCode.expiresAt || validCode.expiresAt < new Date()) {
                return res.status(403).json({ msg: 'Invalid or expired code. Please verify your code.' })
            }

            finalRole = 'staff'
            finalCity = city
            finalDepartment = department
            
            validCode.used = true
            await validCode.save()
        }

        if(finalRole === 'citizen'){
            if (city && !citiesWithAdmin.map(c => c.toLowerCase()).includes(city.toLowerCase())) {
                const gAdmin = await getGlobalAdmin() 
                const gAdminEmail = gAdmin ? gAdmin.email : 'No global admin yet'
                console.log(
                `Citizen registered for city ${city} with no admin yet. Global Admin (${gAdminEmail}) will handle complaints temporarily.`
                )
            }
            finalCity = city || null;
            finalDepartment = null;
        }

        // create new user
         user = new User({
            name,
            email,
            password,
            role: finalRole,
            city: finalCity,
            department: finalDepartment
        })

        // Hash password
        user.password = await hashPassword(password);
        await user.save();

        const token = generateToken(user.id, user.role);
        res.json({ token, role : user.role });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// login
router.post("/login", async (req, res) => {
  const { email, password, city, department } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    if (!user.password) {
      return res.status(400).json({
        msg: "No password for this user. Use social login or reset password.",
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });
    
    // Admin city validation
    if (user.role === 'admin') {
      if (!city || user.city !== city) {
        return res.status(403).json({ msg: 'Invalid city for admin login' })
      }
    }

    // Staff validation (city + dept)
    if (user.role === 'staff') {
      if (!city || !department || user.city !== city || user.department !== department) {
        return res.status(403).json({ msg: 'Invalid city or department for staff login' })
      }
    }

    const token = generateToken(user.id, user.role);
    res.json({ token, role : user.role, city : user.city });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

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
