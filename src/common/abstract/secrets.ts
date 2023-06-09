import { Solution } from './solution';

export abstract class Secrets extends Solution {
    public defaultOptions: any = {
        cache: true,
    };
    protected static cache: any = {};

    protected async get(path: string, fn: any) {
        if (this.options.cache) {
            return Secrets.cache[path] || (Secrets.cache[path] = await fn(path));
        }

        return await fn(path);
    }

    clearCache() {
        Secrets.cache = {};
    }

    async getSecretValue(path: string) {
        return this.get(path, async (path) => await this._getSecretValue(path));
    }

    async _getSecretValue(path: string) {
        return '';
    }
}
