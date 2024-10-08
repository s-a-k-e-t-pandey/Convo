import session from "express-session";

declare module 'express-session' {
    interface SessionData {
        user?: {
            username: string,
            email: string
        },
        views?: number;
    }
}