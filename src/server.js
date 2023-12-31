import dotenv from 'dotenv';
const result = dotenv.config();
if (result.error) {
    console.error(result.error);
}
import express from 'express';
import 'colors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import lspRoutes from './routes/lspRoutes.js';
import moneyRoutes from './routes/moneyRoutes.js';
import connectDB from './config/db.js';
import {notFound , errorHandler} from  './middlewares/errorMiddleware.js'; 

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.json()); // for parsing application/json

app.get('/test',(req,res)=>{
    res.send("TEST");
})

app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/user' , userRoutes);
app.use('/api/v1/lsp',lspRoutes);
app.use('/api/v1/money',moneyRoutes);
app.use(errorHandler);
app.use(notFound);


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
