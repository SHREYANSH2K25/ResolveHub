import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import authRoutes from './src/routes/auth.js'
import complaintRoutes from './src/routes/complaints.js'
import adminRoutes from './src/routes/admin.js'
import cors from 'cors'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path'; 

// 💡 NEW: Import the model loading function from your ML service
import { loadModels } from './src/services/triageService.mjs'; 

// --- ESM PATH SETUP ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// ----------------------

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection function
const connectDB = async() => {
    try{
        // ⚠️ Ensure process.env.MONGO_URI is defined in your .env file
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    }
    catch(err){
        console.error('MongoDB connection error : ', err.message);
        process.exit(1); // Exit process if DB connection fails
    }
};


// --- INITIALIZATION FUNCTION ---
const initializeApp = async () => {
    
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Load ML Models
    try {
        // This loads the local labels and custom model, and fetches the MobileNet model
        await loadModels(); 
        console.log('ML Triage Models initialized successfully.');
    } catch (error) {
        console.error('FATAL ERROR: ML Model loading failed. Triage Service is unavailable.', error);
        // Do not exit if the server can still run without ML (e.g., for user auth),
        // but it's often safer to exit if core functionality fails.
        // process.exit(1); 
    }


    // --- MIDDLEWARE & CONFIG ---
    const allowedOrigins = [
        'http://localhost:5173', 
    ];
    const corsOptions = {
        origin: allowedOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    };
    app.use(cors(corsOptions));
    app.use(express.json());


    // 3. MODEL SERVING ROUTE
    // Use the ESM path fix to correctly point from /BACKEND to /src/services/mobilenet_model
    const modelDir = path.join(__dirname, 'src', 'services', 'mobilenet_model');
    app.use('/model', express.static(modelDir));
    console.log(`Model server: Static models available at http://localhost:${PORT}/model`);

    
    // --- API ROUTES ---
    app.use('/api/auth', authRoutes);
    app.use('/api/complaints', complaintRoutes);
    app.use('/api/admin', adminRoutes);

    // Root route
    app.get('/', (req, res) => 
        res.send("ResolveHub is running...")
    );


    // 4. Start Server Listening
    app.listen(PORT, () => {
        console.log(`\nServer started on ${PORT}.`);
    });
};

// Start the entire application
initializeApp();