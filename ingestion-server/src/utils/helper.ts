import { hash, compare } from "bcryptjs";
import { randomBytes } from "node:crypto";

export async function hashData(password: string, saltRounds: number) {
    return await hash(password, saltRounds);
}

export async function compareData(password: string, hashedPassword: string) {
    return await compare(password, hashedPassword);
}

export function generateApiCredentials() {
    const randomKeyBytes = randomBytes(32).toString('hex');
    const apiKey = `ingest_apk_${randomKeyBytes}`;

    const randomSecretBytes = randomBytes(48).toString('hex');
    const apiSecret = `ingest_asec_${randomSecretBytes}`;

    return { apiKey, apiSecret };
}
