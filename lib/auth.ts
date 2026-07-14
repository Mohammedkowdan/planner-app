import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// ✅ Fail fast if SESSION_SECRET is not configured — never fall back to a weak default
const rawSecret = process.env.SESSION_SECRET;
if (!rawSecret) {
    throw new Error(
        "SESSION_SECRET environment variable is not set. " +
        "Please add it to your .env file before starting the application."
    );
}
const key = new TextEncoder().encode(rawSecret);

export interface SessionPayload {
    userId: string;
    userName: string;
    role: string;
    orgId: string;
    orgName: string;
    deptId: string;
    deptName: string;
    expires: Date;
}

export async function encrypt(payload: SessionPayload) {
    return await new SignJWT(payload as unknown as Record<string, unknown>)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
}

export async function createSession(
    userId: string,
    userName: string,
    role: string,
    orgId: string,
    deptId: string,
    orgName: string,
    deptName: string
) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await encrypt({ userId, userName, role, orgId, deptId, orgName, deptName, expires });

    (await cookies()).set("session", session, {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
}

export async function deleteSession() {
    (await cookies()).delete("session");
}

export async function getSession(): Promise<SessionPayload | null> {
    const session = (await cookies()).get("session")?.value;
    if (!session) return null;
    try {
        return await decrypt(session);
    } catch {
        return null;
    }
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get("session")?.value;
    if (!session) return;

    let parsed: SessionPayload;
    try {
        parsed = await decrypt(session);
    } catch {
        return;
    }

    parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
        name: "session",
        value: await encrypt(parsed),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: parsed.expires,
        path: "/",
    });
    return res;
}
