import express from "express";
import cors from 'cors';
import { initCOS, getObject, putObject, deleteObject } from './cos';

const app = express();

app.use(cors());

const config = {
    bucket: 'test-shanghai-1319827086',
    region: 'ap-shanghai',
};

app.put("/cos", async (req, res)  => {
    const localFilePath = req.query.localFilePath as string;
    const bucketKey = req.query.bucketKey as string;
    console.log(localFilePath, bucketKey);

    initCOS().then((cos) => {
        return putObject(localFilePath, bucketKey, cos, config);
    }).then(() => {
        res.status(200).send('Success');
    }).catch((err) => {
        res.status(500).send(err);
    });
});

app.get("/cos", async (req, res) => {
    const bucketKey = req.query.bucketKey as string;
    const outputPath = req.query.outputPath as string;
    console.log(bucketKey, outputPath);

    initCOS().then((cos) => {
        return getObject(bucketKey, outputPath, cos, config);
    }).then(() => {
        res.status(200).send('Success');
    }).catch((err) => {
        res.status(500).send(err);
    });
});

app.delete("/cos", async (req, res) => {
    const bucketKey = req.query.bucketKey as string;
    console.log(bucketKey);

    initCOS().then((cos) => {
        return deleteObject(bucketKey, cos, config);
    }).then(() => {
        res.status(200).send('Success');
    }).catch((err) => {
        res.status(500).send(err);
    });
});

app.get("/", async (req, res) => {
    res.status(200).send('Hello World');
});

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send(`Internal Server Error: ${err}`);
});


export default app;