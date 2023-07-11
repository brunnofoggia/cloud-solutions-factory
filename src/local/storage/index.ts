import _debug from 'debug';
const debug = _debug('solutions:storage:fs');

import path from 'path';
import { createInterface } from 'readline';
import fs from 'fs/promises';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { map } from 'lodash';

import { StorageOutputEnum } from '../../common/types/storageOutput.enum';
import { StorageInterface } from '../../common/interfaces/storage.interface';
import { Storage } from '../../common/abstract/storage';
import { WriteStream } from './writeStream';

export class Fs extends Storage implements StorageInterface {
    protected defaultOptions: any = {
        basePath: path.join(process.cwd(), 'tmp'),
        baseDir: 'tmp',
    };

    async readContent(filePath, options: any = {}) {
        this.isInitialized();
        const _path = path.join(options.basePath || this.options.basePath, filePath);
        return await fs.readFile(_path, 'utf8');
    }

    async readStream(filePath, options: any = {}) {
        this.isInitialized();
        const _path = path.join(options.basePath || this.options.basePath, filePath);
        const data = createReadStream(_path);
        const rl = createInterface({
            input: data,
            crlfDelay: Infinity,
        });

        return rl;
    }

    createDirIfNotExists(_path) {
        let directoryPath = !_path.startsWith(this.options.basePath) ? path.join(this.options.basePath, _path) : _path;

        const splitDirs = directoryPath.split('/');
        splitDirs.pop();
        directoryPath = splitDirs.join('/');

        if (!existsSync(directoryPath)) {
            mkdirSync(directoryPath, { recursive: true });
        }
    }

    async _sendContent(filePath, content, options: any = {}) {
        this.isInitialized();
        let _path;
        try {
            _path = path.join(options.basePath || this.options.basePath, filePath);

            this.createDirIfNotExists(_path);
            await fs.writeFile(_path, content);
            debug(`File sent to ${filePath}`);
        } catch (error) {
            debug(`Fail sending file ${filePath}: ${error}`);
        }
    }

    async sendContent(path, content, options: any = {}, retry = 3) {
        return await this._sendContent(path, content, options);
    }

    async deleteFile(filePath, options: any = {}) {
        this.isInitialized();
        let _path;
        try {
            _path = path.join(options.basePath || this.options.basePath, filePath);
            await fs.rm(_path, { force: true });
            debug(`Deleted file ${_path}`);
            return StorageOutputEnum.Success;
        } catch (error) {
            debug(`Warning: Fail deleting file ${_path}: ${error}`);
            return StorageOutputEnum.NotFound;
        }
    }

    async deleteDirectory(directoryPath, options: any = {}) {
        this.isInitialized();
        let _path;
        try {
            _path = path.join(options.basePath || this.options.basePath, directoryPath);
            await fs.rm(_path, { recursive: true, force: true });
            debug(`Deleted directory ${_path}`);
            return StorageOutputEnum.Success;
        } catch (error) {
            debug(`Warning: Fail deleting directory ${_path}: ${error}`);
            return StorageOutputEnum.NotFound;
        }
    }

    async readDirectory(directoryPath = '', options: any = {}) {
        this.isInitialized();
        let _path;
        try {
            _path = path.join(options.basePath || this.options.basePath, directoryPath);
            const objects = await fs.readdir(_path);
            return map(objects, (name) => [directoryPath, name].join('/'));
        } catch (error) {
            if (!options.silent) debug(`Fail reading directory ${_path}`, error);
            return null;
        }
    }

    sendStream(filePath, params: any = {}) {
        this.isInitialized();
        this.createDirIfNotExists(filePath);
        const upload = async (content) => await this._sendContent(filePath, content, params);

        return new WriteStream(upload);
    }
}
