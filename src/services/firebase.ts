import { createReadStream } from "fs";
const admin = require("firebase-admin");
import path from "path";
import { AbstractFileService, Logger } from "@medusajs/medusa";
import {
    DeleteFileType,
    FileServiceGetUploadStreamResult,
    FileServiceUploadResult,
    GetUploadedFileType,
    UploadStreamDescriptorType,
} from "@medusajs/types";
import { PassThrough } from "stream";

interface FirebaseOptions {
    service_account_key: string;
    bucket_name: string;
    upload_dir: string;
}

class FirebaseFileService extends AbstractFileService {
    private bucket: any;
    private upload_dir: string;
    protected logger_: Logger;
    protected publicPath = "uploads"
    protected protectedPath = "protected-uploads"

    constructor({ logger }: any, options: FirebaseOptions) {
        // @ts-ignore
        super(...arguments);
        this.logger_ = logger;

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(options.service_account_key)),
                storageBucket: options.bucket_name,
            });
        }

        this.bucket = admin.storage().bucket();
        this.upload_dir = options.upload_dir;
    }

    async upload(fileData: Express.Multer.File): Promise<FileServiceUploadResult> {
        // const fileName = `${this.upload_dir}/${path.basename(fileData.originalname)}`;
        const fileName = `${path.basename(fileData.originalname)}`;
        const file = this.bucket.file(fileName);

        // Use the `createReadStream` to upload the file
        const stream = createReadStream(fileData.path);

        await new Promise((resolve, reject) => {
            stream
                .pipe(
                    file.createWriteStream({
                        metadata: {
                            contentType: fileData.mimetype,
                            public: true, // Set to `true` to make the file publicly accessible
                        },
                    })
                )
                .on("error", reject)
                .on("finish", resolve);
        });

        const [url] = await file.getSignedUrl({
            action: "read",
            expires: "03-09-2491",
        });

        return { key: fileName, url };
    }
    async uploadProtected(fileData: Express.Multer.File): Promise<FileServiceUploadResult> {
        // const fileName = `${this.upload_dir}/private/${path.basename(fileData.originalname)}`;
        const fileName = `private/${path.basename(fileData.originalname)}`;
        const file = this.bucket.file(fileName);

        const stream = createReadStream(fileData.path);

        await new Promise((resolve, reject) => {
            stream
                .pipe(
                    file.createWriteStream({
                        metadata: {
                            contentType: fileData.mimetype,
                        },
                    })
                )
                .on("error", reject)
                .on("finish", resolve);
        });

        const [url] = await file.getSignedUrl({
            action: "read",
            expires: "03-09-2491",
        });

        return { key: fileName, url };
    }
    async delete(fileData: DeleteFileType): Promise<void> {
        const file = this.bucket.file(fileData.fileKey);

        await file.delete().catch((error: any) => {
            console.error(`Failed to delete file: ${error}`);
            throw error;
        });
    }
    async getUploadStreamDescriptor(fileData: UploadStreamDescriptorType): Promise<FileServiceGetUploadStreamResult> {
        console.log("🚀 ~ FirebaseFileService ~ getUploadStreamDescriptor ~ fileData:", fileData);
        const fileName = `${fileData.name}.${fileData.ext}`;
        const file = this.bucket.file(fileName);
        const passThrough = new PassThrough();
        const writeStream = file.createWriteStream({
            metadata: {
                contentType: fileData.ext,
            },
        });

        passThrough.pipe(writeStream);

        return {
            writeStream: passThrough,
            promise: new Promise((resolve, reject) => {
                writeStream.on("finish", () => resolve({ url: fileName, key: fileName }));
                writeStream.on("error", reject);
            }),
            // url: `https://storage.googleapis.com/${this.bucket.name}/${this.upload_dir}/${fileName}`,
            url: `https://storage.googleapis.com/${this.bucket.name}/${fileName}`,
            fileKey: fileName,
        };
    }
    async getDownloadStream(fileData: GetUploadedFileType): Promise<NodeJS.ReadableStream> {
        console.log("🚀 ~ FirebaseFileService ~ getDownloadStream ~ fileData:", fileData);
        const file = this.bucket.file(fileData.fileKey);
        const [exists] = await file.exists();
        if (!exists) {
            throw new Error("File not found");
        }
        return file.createReadStream();
    }
    async getPresignedDownloadUrl(fileData: GetUploadedFileType): Promise<string> {
        console.log("🚀 ~ FirebaseFileService ~ getPresignedDownloadUrl ~ fileData:", fileData);
        const file = this.bucket.file(fileData.fileKey);
        const [exists] = await file.exists();
        if (!exists) {
            throw new Error("File not found");
        }
        const [url] = await file.getSignedUrl({
            action: "read",
            expires: "03-09-2491",
            responseDisposition: `attachment; filename="${fileData.fileKey}"`,
        });
        return url;
    }
}

export default FirebaseFileService;
