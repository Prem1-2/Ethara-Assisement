const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Shared cookie options. `secure` is disabled in development so cookies work
 * over plain http://localhost. In production (NODE_ENV !== "development") the
 * cookies are marked Secure and require HTTPS.
 *
 * Note: Express `maxAge` is in MILLISECONDS (the original Next.js cookies API
 * used seconds), so the max-age constants below are expressed in ms.
 */
export const cookieBase = () => ({
	httpOnly: true,
	secure: process.env.NODE_ENV !== "development",
	sameSite: "strict",
	path: "/",
});

export const ACCESS_TOKEN_MAX_AGE = DAY_MS; // 1 day
export const REFRESH_TOKEN_MAX_AGE = 5 * DAY_MS; // 5 days
