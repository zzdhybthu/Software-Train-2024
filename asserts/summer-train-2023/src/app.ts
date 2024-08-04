import express from "express";
import cors from 'cors';
const app = express();

const port = 3000;

app.use(cors());

app.get("/route1", (req, res) => {
    res.send("Hello, world!");
});

app.get("/route2", (req, res) => {
    res.send("Hello, world! from 2");
});

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send(`Internal Server Error: ${err}`);
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
})

console.log('hello, backend!');