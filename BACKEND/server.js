import './src/config/loadEnv.js'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import session from 'express-session'
import passport from 'passport'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

// Routes
import authRoutes from "./src/routes/auth.js";
import complaintRoutes from "./src/routes/complaints.js";
import adminRoutes from "./src/routes/admin.js";
import debugRoutes from "./src/routes/debug.js";

// ML model service
import { loadModels } from "./src/services/triageService.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const PORT = process.env.PORT || 5000;

// ---------------- Database Connection ----------------
const connectDB = async () => {
  try {
    const mongoUri =
        process.env.MONGO_URI ||
        process.env.MONGODB_URI ||
        process.env.MONGODB_URL ||
        process.env.DATABASE_URL;

    if (!mongoUri || typeof mongoUri !== 'string') {
        console.error(
            'MongoDB connection error: missing MongoDB URI. Set MONGO_URI (or MONGODB_URI) in BACKEND/.env.'
        );
        process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error : ", err.message);
    process.exit(1);
  }
};



const initializeApp = async () => {
    
    // Add all development origins and include an environment variable 
    // for your deployed "universal site" (e.g., Vercel, Netlify URL).
    const allowedOrigins = [
        'http://localhost:5174', // Primary frontend port (development)
        'http://127.0.0.1:5174', // Primary frontend port (development)
        'http://localhost:5173', 
        'http://localhost:5175',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5175',
        'http://127.0.0.1:5176',
        process.env.FRONTEND_URL, // Production frontend URL (Vercel)
        'https://resolvehub-frontend.vercel.app', // Default Vercel domain
        /\.vercel\.app$/, // Allow all Vercel domains
    ].filter(Boolean); // Filters out undefined/null if FRONTEND_URL is not set

    const corsOptions = {
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps, curl, or same-origin)
            if (!origin || origin === 'null') {
                return callback(null, true);
            }
            
            // Check if the requesting origin is in the allowed list
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.log('CORS blocked origin:', origin);
                console.log('Allowed origins:', allowedOrigins);
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
        optionsSuccessStatus: 200
    };
    
    app.use(cors(corsOptions));
    app.use(express.json());

    // ---------------- Session & Passport Middleware ----------------
    // This is mandatory when using 'credentials: true'
    app.use(session({
        secret: process.env.SESSION_SECRET || 'a-fallback-secret-for-development-only', // Define SESSION_SECRET in your .env
        resave: false,
        saveUninitialized: false,
        cookie: { 
            // Must be true in production if client and server are different domains
            secure: process.env.NODE_ENV === 'production', 
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Correct setting for cross-site cookies
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        } 
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    // -----------------------------------------------------------------


    // Debug middleware to log all requests
    app.use((req, res, next) => {
        if (req.url.startsWith('/api/')) {
            console.log('🔍 API Request:', req.method, req.url);
            console.log('🔍 Origin:', req.headers.origin);
            console.log('🔍 ==========================================');
        }
        next();
    });

    
    const modelDir = path.join(__dirname, 'src', 'services', 'mobilenet_model');
    app.use('/model', express.static(modelDir));
    console.log(`Model server: Static models available at http://localhost:${PORT}/model`);


    // Health check route
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development'
        });
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/complaints', complaintRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/debug', debugRoutes);    
    app.get('/', (req, res) => 
        res.send("ResolveHub Backend API is running...")
    );    // ---------------- Global Error Handler (New Addition) ----------------
    // This catches all uncaught exceptions in async routes and middleware
    app.use((err, req, res, next) => {
        // Log the error stack to the server console for debugging
        console.error('🚨 GLOBAL SERVER ERROR HANDLER 🚨');
        console.error(err.stack);

        // Respond to the client with a generic 500 error
        const status = err.status || 500;
        const message = err.message || 'Internal Server Error';

        res.status(status).json({
            error: {
                message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message,
                status: status,
                // Only send stack trace in development mode for security
                stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined 
            }
        });
    });
    // ---------------------------------------------------------------------


    await connectDB();

 
    app.listen(PORT, '0.0.0.0', async () => {
        console.log(`\nServer started on 0.0.0.0:${PORT}`);
        console.log(`Access server at: http://localhost:${PORT}`);
        
       // Load ML Models (Fetch from the server that is now listening) 
        try {
            await loadModels(); 
            console.log('✅ ML Triage Models initialized successfully.');
        } catch (error) {
            console.error('FATAL ERROR: ML Model loading failed. Triage Service is unavailable.', error);
        }

        // Initialize Scheduler Service
        try {
            const schedulerService = (await import('./src/services/schedulerService.js')).default;
            schedulerService.init();
            console.log('✅ Scheduler Service initialized successfully.');
        } catch (error) {
            console.error('ERROR: Scheduler initialization failed:', error);
        }
    });    
};

initializeApp();
