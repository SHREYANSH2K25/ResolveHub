import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import session from 'express-session'
import passport from 'passport'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path'; 

// Routes
import authRoutes from "./src/routes/auth.js";
import complaintRoutes from "./src/routes/complaints.js";
import adminRoutes from "./src/routes/admin.js";

// ML model service
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



const initializeApp = async () => {
  
    const allowedOrigins = [
        'http://localhost:5173', 
        'http://localhost:5174',
        'http://localhost:5175',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
    ];
    const corsOptions = {
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.some(allowed => {
                if (typeof allowed === 'string') return allowed === origin;
                return allowed.test(origin);
            })) {
                callback(null, true);
            } else {
                console.log('CORS blocked origin:', origin);
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
        optionsSuccessStatus: 200
    };
    app.use(cors(corsOptions));
    app.use(express.json());

    
    const modelDir = path.join(__dirname, 'src', 'services', 'mobilenet_model');
    app.use('/model', express.static(modelDir));
    console.log(`Model server: Static models available at http://localhost:${PORT}/model`);


    app.use('/api/auth', authRoutes);
    app.use('/api/complaints', complaintRoutes);
    app.use('/api/admin', adminRoutes);

    
    app.get('/', (req, res) => 
        res.send("ResolveHub is running...")
    );


    
    await connectDB();

 
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

initializeApp();
