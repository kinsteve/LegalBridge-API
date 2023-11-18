import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import 'colors';
import authRoutes from './routes/authRoutes.js';
import connectDB from './config/db.js';
 
const app = express();
app.use(express.json()); // for parsing application/json

app.get('/test',(req,res)=>{
    res.send("TEST");
})

app.use('/api/v1/auth',authRoutes);
const PORT = process.env.PORT || 5000;


const start= async ()=>{
    try {
        await connectDB(process.env.MONGO_URI_PROD)
        app.listen(PORT,()=>{
            console.log(`Server started on port ${PORT}`.yellow.bold);
            console.log("MongoDB Connected".green.bold);
        })
    } catch (error) {
        console.log(`Error:${error.message}`.red.bold);
    }
}

start();
