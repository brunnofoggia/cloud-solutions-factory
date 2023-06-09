import aws from 'aws-sdk';

import { ParameterStore } from './secrets/index';
import { S3 } from './storage/index';
import { SQS } from './events/index';
import { SolutionsEnum } from './solutions';

export const StorageAdapter = S3;
export const SecretsAdapter = ParameterStore;
export const EventsAdapter = SQS;

// export const keyFields = ['accessKeyId', 'secretAccessKey', 'region'];
export const keyFields = { user: 'accessKeyId', pass: 'secretAccessKey', region: 'region' };

/*
{
    region: options.region,
    accessKeyId: options.accessKeyId,
    secretAccessKey: options.secretAccessKey,
}
 */

export const providerConfig = (options: any = {}) => {
    if (!options.region ||
        !options.user ||
        !options.pass) {
        throw new Error('Missing some data into cloud credentials. Received: ' + JSON.stringify(options));
    }

    const _config = {
        region: options.region,
        accessKeyId: options.user,
        secretAccessKey: options.pass,
    };
    aws.config.update(_config);
    aws.config.region = _config.region;
};

export default { StorageAdapter, SecretsAdapter, EventsAdapter, SolutionsEnum, providerConfig };