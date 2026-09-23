import { ApiProperty } from "@nestjs/swagger";
import z from "zod";

export const registerSchema = z.object({
    username: z.string().trim(),
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().trim(),
    confirmPassword: z.string().trim(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

type RegisterType = z.infer<typeof registerSchema>;

export class RegisterDTO implements RegisterType {
    @ApiProperty({
        required: true,
        type: 'string',
        description: 'A unique username',
        example: 'exarl'
    })
    username!: string;

    @ApiProperty({
        required: true,
        type: 'string',
        description: 'Email of the user',
        example: 'example@gmail.com'
    })
    email!: string;

    @ApiProperty({
        required: true,
        type: 'string',
        description: 'Password of the user',
        example: '12345'
    })
    password!: string;

    @ApiProperty({
        required: true,
        type: 'string',
        description: 'The same password as the previous',
        example: '12345'
    })
    confirmPassword!: string;
}

export const generateTokenSchema = z.object({
    apiKey: z.string().trim(),
    apiSecret: z.string().trim(),
});

type GenerateTokenType = z.infer<typeof generateTokenSchema>;

export class GenerateTokenDTO implements GenerateTokenType {
    @ApiProperty({
        required: true,
        type: 'string',
        description: 'Unique key given after registration',
        example: 'ingest_apk_xxxxxxxxxxxxxx'
    })
    apiKey!: string;

    @ApiProperty({
        required: true,
        type: 'string',
        description: 'Unique secret given after registration',
        example: 'ingest_asec_xxxxxxxxxxxxx'
    })
    apiSecret!: string;
}

export class RegisterResponseDTO extends GenerateTokenDTO {}

export class GenerateTokenResponseDTO {
    @ApiProperty({
        required: true,
        type: 'string',
        description: 'Jwt token',
        example: 'efheytjf.xxxxxxxxxxxxxx.skfjdksf'
    })
    token!: string;
}
