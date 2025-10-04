import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import authRoutes from './src/routes/auth.js'

const app = express();

// Database connection
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

connectDB();

app.use(express.json());

//Define routes
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => 
    res.send("ResolveHub is running...")
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}.`))