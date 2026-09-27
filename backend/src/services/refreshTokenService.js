import crypto from 'crypto';

import { redisClient } from '../configs/redis.js';

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

export function hashRefreshToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}
export function generateFamilyId() {
    return crypto.randomUUID();
}

export async function createRefreshSession({ refreshToken, userId, familyId }) {
    const tokenHash = hashRefreshToken(refreshToken);

    await redisClient.set(`refresh:${tokenHash}`, JSON.stringify({ userId: String(userId), familyId, status: 'active' }), {
        EX: REFRESH_TOKEN_TTL,
    });

    await redisClient.set(`family:${familyId}`, JSON.stringify({ userId: String(userId), status: 'active' }), {
        EX: REFRESH_TOKEN_TTL,
    });
}

//--------------------

// These are LUA script for redis
export async function rotateRefreshToken({ oldRefreshToken, newRefreshToken, userId, familyId }) {
    const oldHash = hashRefreshToken(oldRefreshToken);
    const newHash = hashRefreshToken(newRefreshToken);

    const oldKey = `refresh:${oldHash}`;
    const newKey = `refresh:${newHash}`;
    const familyKey = `family:${familyId}`;

    const script = `
        local oldData = redis.call('GET', KEYS[1])

        if not oldData then
            return 'NOT_FOUND'
        end

        local old = cjson.decode(oldData)

        if old.status ~= 'active' then
            return 'REUSED'
        end

        local familyData = redis.call('GET', KEYS[3])

        if not familyData then
            return 'FAMILY_NOT_FOUND'
        end

        local family = cjson.decode(familyData)

        if family.status ~= 'active' then
            return 'FAMILY_REVOKED'
        end

        if tostring(old.userId) ~= tostring(ARGV[1]) then
            return 'INVALID_USER'
        end

        if tostring(old.familyId) ~= tostring(ARGV[2]) then
            return 'INVALID_FAMILY'
        end

        old.status = 'used'

        redis.call(
            'SET',
            KEYS[1],
            cjson.encode(old),
            'EX',
            ARGV[3]
        )

        redis.call(
            'SET',
            KEYS[2],
            cjson.encode({
                userId = tostring(ARGV[1]),
                familyId = ARGV[2],
                status = 'active'
            }),
            'EX',
            ARGV[3]
        )

        return 'ROTATED'
    `;

    return redisClient.eval(script, { keys: [oldKey, newKey, familyKey], arguments: [String(userId), familyId, String(REFRESH_TOKEN_TTL)] });
}

export async function revokeFamily(familyId) {
    await redisClient.set(`family:${familyId}`, JSON.stringify({ status: 'revoked' }), {
        EX: REFRESH_TOKEN_TTL,
    });
}
