import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const port = 3000;

app.listen(port, () => {
    console.log(`listening on port ${port}`);
})