import bcrypt from "bcryptjs";
import crypto from "node:crypto";

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
}

export function generateApiCredentials() {
    const randomKeyBytes = crypto.randomBytes(32).toString('hex');
    const apiKey = ``
}
