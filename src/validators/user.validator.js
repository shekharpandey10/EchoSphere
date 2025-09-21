import { z } from 'zod'

export const validUserSchema = z.object({
    username: z.string().min(3, "username has to be min 3 char").max(50, "username should be less then 50 char"),
    password: z.string().min(8, "password should be min 8 chat").max(50, "password can be max 50 char"),
    email: z.string().email("Invalid Email address"),
    firstname: z.string("Invalid format"),
    lastname: z.string("Invalid format")
})

export const validLoginSchema = z.object({
    username: z.string().min(3, "username has to be min 3 char").max(50, "username should be less then 50 char"),
    password: z.string().min(8, "password should be min 8 chat").max(50, "password can be max 50 char"),
})