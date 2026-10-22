import express, { type Express, type Request, type Response } from 'express';
import authRouter from './routes/auth.routes.js';
import emailRouter from './routes/email.routes.js';

const app: Express = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});
app.get('/middleware', (req: Request, res: Response) => {
  res.send('Hello World World!');
});

app.use(express.json({ limit: "16kb" }));
app.use(authRouter);
app.use(emailRouter);
export default app;