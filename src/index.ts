import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('static'));
app.use(cookieParser());
require('./routes')(app);

app.use((err: any, req: any, res: any, next: any) => {
    res.end('Problem...');
    console.log(err);
});

app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
});