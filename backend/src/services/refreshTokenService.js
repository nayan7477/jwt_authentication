import crypto from 'crypto';

import { redisClient } from '../configs/redis.js';

export function hashRefreshToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export async function storeRefreshToken(token, userId) {
    const tokenHash = hashRefreshToken(token);

    await redisClient.set(`refresh:${tokenHash}`, userId.toString(), {
        EX: 7 * 24 * 60 * 60,
    });
}
