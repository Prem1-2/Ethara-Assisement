import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/**
 * Next.js middleware (proxy) — route guarding only.
 *
 * After the frontend/backend split this middleware no longer touches the
 * database. The JWT issued by the backend already carries `id`, `role` and
 * `isAdmin`, so verifying the token (with the shared TOKEN_SECRET) is enough to
 * guard the UI routes. The backend independently re-verifies on every API call.
 */

/**
 * Clear BOTH auth cookies.
 */
const clearAuthCookies = (response) => {
	response.cookies.set("token", "", {
		httpOnly: true,
		expires: new Date(0),
		path: "/",
	});

	response.cookies.set("sessionId", "", {
		httpOnly: true,
		expires: new Date(0),
		path: "/",
	});

	return response;
};

/**
 * Normalize path (strip trailing slash).
 */
const normalizePath = (path) => {
	if (!path) return "/";
	if (path.length > 1 && path.endsWith("/")) {
		return path.slice(0, -1);
	}
	return path;
};

export default async function proxy(request) {
	const currentPath = request.nextUrl.pathname;

	const accessToken = request.cookies.get("token")?.value;
	const sessionId = request.cookies.get("sessionId")?.value;

	const normalizedPath = normalizePath(currentPath);

	const publicPaths = [
		"/auth/login",
		"/auth/signup",
		"/auth/admin-signup",
		"/auth/register",
		"/auth/reset-email",
		"/auth/reset-password",
		"/auth/verify-email",
		"/unauthorized",
	];

	const isPublicRoute = publicPaths.some(
		(path) => normalizePath(path) === normalizedPath,
	);

	const buildLoginUrl = () => {
		const loginUrl = new URL("/auth/login", request.url);
		loginUrl.searchParams.set("callbackUrl", currentPath);
		return loginUrl;
	};

	// ── Public routes ────────────────────────────────────────────────────────
	if (isPublicRoute) {
		const isLoginPage =
			normalizedPath === "/auth/login" ||
			normalizedPath === "/auth/signup" ||
			normalizedPath === "/auth/admin-signup";

		// If the user is already authenticated, bounce them off the login pages.
		if (accessToken && sessionId && isLoginPage) {
			try {
				const decoded = jwt.verify(accessToken, process.env.TOKEN_SECRET);

				if (decoded?.isAdmin) {
					return NextResponse.redirect(
						new URL("/admin/dashboard", request.url),
					);
				}

				return NextResponse.redirect(new URL("/", request.url));
			} catch {
				return clearAuthCookies(NextResponse.next());
			}
		}
		return NextResponse.next();
	}

	// ── Protected routes ─────────────────────────────────────────────────────
	if (!accessToken || !sessionId) {
		return NextResponse.redirect(buildLoginUrl());
	}

	let decoded;
	try {
		decoded = jwt.verify(accessToken, process.env.TOKEN_SECRET);
	} catch {
		return clearAuthCookies(NextResponse.redirect(buildLoginUrl()));
	}

	const isAdmin = !!decoded.isAdmin;
	const role = decoded.role;

	if (normalizedPath.startsWith("/admin")) {
		if (role !== "admin" && !isAdmin) {
			return NextResponse.redirect(new URL("/unauthorized", request.url));
		}
		return NextResponse.next();
	}

	if (normalizedPath.startsWith("/member")) {
		if (role !== "member" && !isAdmin) {
			return NextResponse.redirect(new URL("/unauthorized", request.url));
		}
		return NextResponse.next();
	}

	if (normalizedPath === "/") {
		if (isAdmin) {
			return NextResponse.redirect(new URL("/admin/dashboard", request.url));
		}
		return NextResponse.redirect(new URL("/member/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
