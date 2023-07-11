import dotenv from 'dotenv';
dotenv.config({ path: 'test/env/aws/.env' });
import { S3 } from '.';
import AWS from 'aws-sdk';
import { Interface } from 'readline';
import { WriteStream } from './writeStream';
import {
    checkDirectoryContentLength,
    checkOptions,
    createInstance,
    deleteDirectory,
    deleteFile,
    getDirectoryContentLength,
    getInstance,
    readContent,
    readDirectory,
    readStream,
    sendContent,
    sendStream,
    toBeDefined,
} from '@/common/abstract/storage.test';

describe('Aws Storage', () => {
    let storage: S3;

    beforeAll(() => {
        const providerOptions = {
            region: process.env.CLOUD_REGION,
            user: process.env.CLOUD_USER,
            pass: process.env.CLOUD_PASS,
        };
        const Bucket = process.env.CLOUD_BUCKET;
        storage = new S3(providerOptions);
        storage.initialize({ Bucket });
    });

    describe('to be defined', () => {
        it('storage', async () => {
            await toBeDefined.storage(storage);
        });
    });

    describe('method: checkOptions', () => {
        it('should be valid', () => {
            checkOptions.shouldBeValid(storage);
        });
        it('should throw error', async () => {
            await checkOptions.shouldThrowError(S3);
        });
    });

    describe('method: getInstance', () => {
        it('should be instance of AWS.S3', () => {
            getInstance.shouldBeInstanceOf(storage, AWS.S3);
        });
    });

    describe('method: createInstance', () => {
        it('value should be instance of AWS.S3', () => {
            createInstance.shouldBeInstanceOf(storage, AWS.S3);
        });
    });

    describe('method: sendContent', () => {
        it('upload file', async () => {
            await sendContent.uploadFile(storage);
        });

        it('upload file into subdirectory', async () => {
            await sendContent.uploadFileIntoSubDirectory(storage);
        });
    });

    describe('method: readContent', () => {
        it('should match content', async () => {
            await readContent.shouldMatchContent(storage);
        });

        it('should throw error for unexistent file', async () => {
            await readContent.shouldThrowErrorForUnexistentFile(storage);
        });
    });

    describe('method: sendStream', () => {
        it('should return instance of WriteStream', async () => {
            await sendStream.shouldReturnInstanceOfWriteStream(storage, WriteStream);
        });

        it('should send content', async () => {
            await sendStream.shouldSendContent(storage);
        });
    });

    describe('method: readStream', () => {
        it('should be instance of Interface', async () => {
            await readStream.shouldReturnInstanceOfInterface(storage, Interface);
        });

        it('should match content', async () => {
            await readStream.shouldMatchContent(storage);
        });
    });

    describe('method: readDirectory', () => {
        it('should have content', async () => {
            await readDirectory.shouldHaveContent(storage);
        });

        it('should match content list', async () => {
            await readDirectory.shouldMatchContentList(storage);
        });

        it('should have nothing', async () => {
            await readDirectory.shouldHaveNothing(storage);
        });
    });

    describe('method: getDirectoryContentLength', () => {
        it('should have something into rootdir', async () => {
            await getDirectoryContentLength.shouldHaveSomethingIntoRootdir(storage);
        });

        it('should have something into dir', async () => {
            await getDirectoryContentLength.shouldHaveSomethingIntoDir(storage);
        });

        it('should have nothing into unexistent directory', async () => {
            await getDirectoryContentLength.shouldHaveNothingIntoUnexistentDirectory(storage);
        });
    });

    describe('method: checkDirectoryContentLength', () => {
        it('should exist rootdir', async () => {
            await checkDirectoryContentLength.shouldExistRootdir(storage);
        });

        it('should exist dir', async () => {
            await checkDirectoryContentLength.shouldExistDir(storage);
        });

        it('should not exist', async () => {
            await checkDirectoryContentLength.shouldNotExist(storage);
        });
    });

    describe('method: deleteFile', () => {
        it('should do', async () => {
            await deleteFile.shouldDo(storage);
        });
    });

    describe('method: deleteDirectory', () => {
        it('should delete recursively', async () => {
            await deleteDirectory.shouldDeleteRecursively(storage);
        });

        it('should omit deletion of unexistent directory', async () => {
            await deleteDirectory.shouldOmitDeletionOfUnexistentDirectory(storage);
        });
    });
});
