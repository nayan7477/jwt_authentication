import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { router } from './routes/route.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use('/', router);

app.listen(3000, () => console.log('server started'));
