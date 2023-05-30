import _ from 'lodash';
import { Storage as GStorage } from '@google-cloud/storage';
import { createInterface } from 'readline';

import { StorageOutputEnum } from '../../common/types/storageOutput.enum.js';
import { StorageInterface } from '../../common/interfaces/storage.interface.js';
import { Storage as AStorage } from '../../common/abstract/storage.js';
import { providerConfig, keyFields } from '../index.js';

export class Storage extends AStorage implements StorageInterface {
    protected instance;

    async initialize(options: any = {}) {
        super.initialize(options);
        this.checkOptions();
        this.instance = this.createInstance(options);
    }

    getInstance(options: any = {}) {
        if (_.intersection(_.keys(options), _.keys(keyFields)).length > 0) {
            const instance = this.createInstance(options);
            return instance;
        }
        return this.instance;
    }

    createInstance(options: any = {}) {
        const config = providerConfig(_.defaults(
            _.omitBy(_.pick(options, ..._.keys(keyFields)), (value) => !value),
            _.pick(this.providerOptions, ..._.keys(keyFields)),
        ));
        console.log('config without empty opt', _.omitBy(_.pick(options, ..._.keys(keyFields)), (value) => !value));


        const instance = new GStorage({
            ...config
        });

        return instance;
    }

    async readContent(path, options: any = {}) {
        this.isInitialized();
        const storage = this.getInstance(options);
        const Bucket = options.Bucket || this.getOptions().Bucket;
        const [fileContent] = await storage.bucket(Bucket).file(path).download();
        return fileContent?.toString(options.charset || 'utf-8');
    }

    async readStream(path, options: any = {}) {
        this.isInitialized();
        const storage = this.getInstance(options);
        const Bucket = options.Bucket || this.getOptions().Bucket;

        const data = storage.bucket(Bucket).file(path).createReadStream();
        const rl = createInterface({
            input: data,
            crlfDelay: Infinity
        });

        return rl;
    }

    async _sendContent(path, content, options: any = {}) {
        this.isInitialized();
        const storage = this.getInstance(options);
        const Bucket = options.Bucket || this.getOptions().Bucket;
        await storage.bucket(Bucket).file(path).save(content);
    }

    async deleteDirectory(directoryPath, options: any = {}) {
        this.isInitialized();
        const storage = this.getInstance(options);
        const Bucket = options.Bucket || this.getOptions().Bucket;

        const [files] = await storage.bucket(Bucket).getFiles({ prefix: directoryPath });
        const deletePromises = [];
        files.forEach((file) => {
            deletePromises.push(file.delete());
        });

        const [subdirectories] = await storage.bucket(Bucket).getFiles({ prefix: directoryPath, delimiter: '/' });
        subdirectories.forEach((subdirectory) => {
            deletePromises.push(this.deleteDirectory(subdirectory.name));
        });

        await Promise.all(deletePromises);

        return StorageOutputEnum.Success;
    }

    async readDirectory(directoryPath, options: any = {}) {
        this.isInitialized();
        const storage = this.getInstance(options);
        const Bucket = options.Bucket || this.getOptions().Bucket;

        const [files] = await storage.bucket(Bucket).getFiles({ prefix: directoryPath });

        let filePaths = [];
        for (const file of files) {
            const filePath = file.name.replace(`gs://${Bucket}/${options.directoryPath || directoryPath}`, '');
            filePaths.push(filePath);
        }

        const [subdirectories] = await storage.bucket(Bucket).getFiles({ prefix: directoryPath, delimiter: '/' });

        for (const subdirectory of subdirectories) {
            const subdirectoryPath = subdirectory.name;
            const subdirectoryFilePaths = await this.readDirectory(subdirectoryPath, { ...options, directoryPath });
            filePaths = filePaths.concat(subdirectoryFilePaths);
        }

        return filePaths;
    }

    async checkDirectoryExists(directoryPath, options: any = {}) {
        const objects = await this.readDirectory(directoryPath, options);
        return objects?.length > 0;
    }
}