import bcrypt from "bcryptjs";
import crypto from "node:crypto";

export async function hashData(password: string, saltRounds: number) {
    return await bcrypt.hash(password, saltRounds);
}

export async function compareData(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
}

export function generateApiCredentials() {
    const randomKeyBytes = crypto.randomBytes(32).toString('hex');
    const apiKey = `ingest_apk_${randomKeyBytes}`;

    const randomSecretBytes = crypto.randomBytes(32).toString('hex');
    const apiSecret = `ingest_asec_${randomSecretBytes}`;

    return { apiKey, apiSecret };
}
