import STS from "qcloud-cos-sts";
import COS from "cos-nodejs-sdk-v5";
import fStream from 'fs';

const getSTS: any = async (action: string[], prefix: string) => {
    const config = {
        secretId: process.env.GROUP_SECRET_ID!,
        secretKey: process.env.GROUP_SECRET_KEY!,
        proxy: '',
        host: 'sts.tencentcloudapi.com',
        durationSeconds: 10,
        bucket: 'test-shanghai-1319827086',
        region: 'ap-shanghai',
    };
    const scope = [{
        action: action,
        bucket: config.bucket,
        region: config.region,
        prefix: prefix,
    }];
    const policy = STS.getPolicy(scope);
    return new Promise((resolve, reject) => STS.getCredential({
        secretId: config.secretId,
        secretKey: config.secretKey,
        proxy: config.proxy,
        policy: policy,
        durationSeconds: config.durationSeconds,
    }, (err, credential) => {
        if (err) reject(err);
        else resolve(credential);
    }))
};


export const initCOS: any = async () => {
    const sts = await getSTS([
        "name/cos:GetObject",
        "name/cos:DeleteObject",
        "name/cos:HeadObject",
        "name/cos:PutObject",
        "name/cos:GetBucket"
    ], "*");

    const cos = new COS({
        getAuthorization: async (options, callback) => {
            try {
                if (!sts) throw (Error("Credentials invalid!"));
                callback({
                    TmpSecretId: sts.credentials.tmpSecretId,
                    TmpSecretKey: sts.credentials.tmpSecretKey,
                    SecurityToken: sts.credentials.sessionToken,
                    StartTime: sts.startTime,
                    ExpiredTime: sts.expiredTime,
                });
            } catch (err) {
                console.log(err);
            }
        }
    });

    return cos;
}


export const getObject: any = async (key: string, outputPath: string, cos: COS, config: any) => {
    return new Promise((resolve, reject) => {
        cos.headObject({
            Bucket: config.bucket,
            Region: config.region,
            Key: key,
        }, (err, data) => {
            if (data) {
                cos.getObject({
                    Bucket: config.bucket,
                    Region: config.region,
                    Key: key,
                    Output: fStream.createWriteStream(outputPath),
                }, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            } else {
                reject(`key: ${key} Not found.`);
            }
        });
    });
};


export const putObject: any = async (localFilePath: string, bucketKey: string, cos: COS, config: any) => {
    return new Promise((resolve, reject) => {
        const fileStream = fStream.createReadStream(localFilePath);
        fileStream.on('error', (err) => {
            console.log('File Stream Error', err);
            reject('Failed to read local file');
        });
        console.debug('Uploading object to COS');
        cos.putObject({
            Bucket: config.bucket,
            Region: config.region,
            Key: bucketKey,
            Body: fileStream,
        }, (err, data) => {
            if (err) {
                console.log(err);
                console.log('Failed to upload object to COS');
                reject('Failed to upload object to COS');
            } else {
                resolve(true);
            }
        });
    });
};


export const deleteObject: any = async (key: string, cos: COS, config: any) => {
    return new Promise((resolve, reject) => {
        cos.deleteObject({
            Bucket: config.bucket,
            Region: config.region,
            Key: key,
        }, (err, data) => {
            if (err) {
                console.log(err);
                reject('Failed to delete object from COS');
            } else {
                resolve(true);
            }
        });
    });
}
