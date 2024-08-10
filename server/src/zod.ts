import z from 'zod'

export const signupInput = z.object({
    username: z.string()
                .min(8, { message: "username must contain 8 characters" })
                .max(15, { message: "username must not exceed 15 characters" }),
    email: z.string().email(),
    password: z.string()
                .min(8, { message: "Password must contain 8 characters" })
                .max(50, { message: "Password must not exceed 50 characters" })
                .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, { message: "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character" })
})

export const signinInput = z.object({
    email: z.union([z.string().email(), z.string()]),
    password: z.string()
})