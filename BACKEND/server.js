// server.js
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Routes
import authRoutes from "./src/routes/auth.js";
import complaintRoutes from "./src/routes/complaints.js";
import adminRoutes from "./src/routes/admin.js";

// ML model service (optional)
import { loadModels } from "./src/services/triageService.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------- Database Connection ----------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error : ", err.message);
    process.exit(1);
  }
};

// ---------------- CORS ----------------
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ---------------- Session & Passport ----------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set true in production with HTTPS
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ---------------- Static ML Models ----------------
const modelDir = path.join(__dirname, "src", "services", "mobilenet_model");
app.use("/model", express.static(modelDir));
console.log(`Model server: Static models at http://localhost:${PORT}/model`);

// ---------------- API Routes ----------------
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);

// ---------------- Root Route ----------------
app.get("/", (req, res) => res.send("ResolveHub is running..."));

// ---------------- Start Server ----------------
const startServer = async () => {
  await connectDB();

  app.listen(PORT, async () => {
    console.log(`Server started on ${PORT}.`);

    // Load ML Models (if available)
    try {
      await loadModels();
      console.log("✅ ML Triage Models initialized successfully.");
    } catch (error) {
      console.warn(
        "⚠️ ML Model loading failed. Triage Service is unavailable.",
        error.message
      );
    }
  });
};

startServer();
