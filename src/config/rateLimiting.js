// config/rateLimiting.js - Rate limiting configuration
import rateLimit from 'express-rate-limit';

const createRateLimiter = (windowMs, max, message) => rateLimit({
    windowMs,
    max,
    message: { success: false, error: message },
    headers: true,
    skip: (req) => req.path.includes('/health'),
    standardHeaders: true,
    legacyHeaders: false,
});

export const rateLimiters = {
    general: createRateLimiter(
        60 * 1000, // 1 minute
        100, // 100 requests per minute
        'Too many requests, please try again later.'
    ),

    login: createRateLimiter(
        60 * 1000, // 1 minute
        10, // 10 requests per minute
        'Too many login requests, please slow down.'
    )
};
