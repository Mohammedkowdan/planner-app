import { hash, compare } from "bcryptjs";
import { randomBytes } from "crypto";

const RESET_TOKEN_EXPIRY_HOURS = 1;

export async function hashPassword(password: string): Promise<string> {
    // 12 rounds is a good balance for security/performance
    return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
}

export async function generateResetToken(): Promise<string> {
    return randomBytes(32).toString("hex");
}

export async function createPasswordResetToken(userId: string): Promise<{ token: string; expires: Date }> {
    const { prisma } = await import("@/lib/db");
    const token = await generateResetToken();
    const expires = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
        data: {
            userId,
            token,
            expires,
        },
    });

    return { token, expires };
}

export async function verifyResetToken(token: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
    const { prisma } = await import("@/lib/db");

    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
    });

    if (!resetToken) {
        return { valid: false, error: "Token not found" };
    }

    if (resetToken.used) {
        return { valid: false, error: "Token already used" };
    }

    if (new Date() > resetToken.expires) {
        return { valid: false, error: "Token expired" };
    }

    return { valid: true, userId: resetToken.userId };
}

export async function markTokenAsUsed(token: string): Promise<void> {
    const { prisma } = await import("@/lib/db");
    await prisma.passwordResetToken.update({
        where: { token },
        data: { used: true },
    });
}

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push("يجب أن تكون كلمة المرور 8 أحرف على الأقل");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("يجب أن تحتوي على حرف كبير واحد على الأقل");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("يجب أن تحتوي على حرف صغير واحد على الأقل");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("يجب أن تحتوي على رقم واحد على الأقل");
    }

    return { valid: errors.length === 0, errors };
}
