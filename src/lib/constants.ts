export const APP_NAME = "Vibekit";
export const APP_DESCRIPTION = "A modern web application";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const AUTH_ROUTES = ["/sign-in", "/sign-up", "/forgot-password"];
export const PUBLIC_ROUTES = ["/", "/api/health", "/api/auth"];
export const DEFAULT_REDIRECT = "/dashboard";

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000,
  MAX_REQUESTS: 100,
  AUTH_MAX_REQUESTS: 10,
} as const;
