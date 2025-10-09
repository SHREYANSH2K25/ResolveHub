import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import authRoutes from './src/routes/auth.mjs' // Ensure this file exists and is correctly structured
import complaintRoutes from './src/routes/complaints.mjs'
import adminRoutes from './src/routes/admin.mjs'
import cors from 'cors'
import session from 'express-session'
import passport from 'passport'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path'; 

// Import the model loading function from your ML service
import { loadModels } from './src/services/triageService.mjs'; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const PORT = process.env.PORT || 5000;

// Database connection function
const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    }
    catch(err){
        console.error('MongoDB connection error : ', err.message);
        process.exit(1); 
    }
};


const initializeApp = async () => {
 
    // --- 1. CONFIGURATION and MIDDLEWARE (Executed before app.listen) ---
    // ✅ Fix implemented from previous step: Corrected 127.0.0.1 CORS syntax
    const allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173', 
        process.env.FRONTEND_URL,
    ].filter(Boolean); // Filter out any undefined or empty values
    const corsOptions = {
        origin: allowedOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    };
    app.use(cors(corsOptions));
    app.use(express.json());

    
    // --- 2. STATIC MODEL SERVING (Executed before app.listen) ---
    const modelDir = path.join(__dirname, 'src', 'services', 'mobilenet_model');
    app.use('/model', express.static(modelDir));
    console.log(`Model server: Static models available at http://127.0.0.1:${PORT}/model`);


    // --- 3. API ROUTES (Executed before app.listen) ---
    app.use('/api/auth', authRoutes);
    app.use('/api/complaints', complaintRoutes);
    app.use('/api/admin', adminRoutes);

    app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // secure: true in production (requires https)
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Root route
app.get('/', (req, res) => 
    res.send("ResolveHub is running...")
);


    // --- 4. ASYNCHRONOUS INITIALIZATION ---
    await connectDB(); // Wait for the database connection

    // --- 5. START SERVER ---
    app.listen(PORT, async () => {
        console.log(`\nServer started on ${PORT}.`);
        
        // Load ML Models (Fetch from the server that is now listening) 
        try {
            await loadModels(); 
            console.log('✅ ML Triage Models initialized successfully.');
        } catch (error) {
            console.error('FATAL ERROR: ML Model loading failed. Triage Service is unavailable.', error);
        }
    });
};

// Start the entire application
initializeApp();