import { Controller, Post, UsePipes } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { ZodValidationPipe } from "../../utils/zod.validation";
import { AuthService } from "./auth.service";
import { GenerateTokenDTO, GenerateTokenResponseDTO, generateTokenSchema, RegisterDTO, RegisterResponseDTO, registerSchema } from "./auth.dto";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('register')
    @UsePipes(new ZodValidationPipe(registerSchema))
    @ApiOperation({
        summary: 'Register user to get APIKEY and APISECRET',
    })
    @ApiOkResponse({
        description: "User Registered Successfully",
        type: RegisterResponseDTO
    })
    @ApiBadRequestResponse()
    async register(dto: RegisterDTO) {
        return await this.authService.register(dto);
    }

    @Post('token')
    @UsePipes(new ZodValidationPipe(generateTokenSchema))
    @ApiOperation({
        summary: 'Generate JWT token with APIKEY and APISECRET',
    })
    @ApiOkResponse({
        description: "Token Generated Successfully",
        type: GenerateTokenResponseDTO
    })
    @ApiBadRequestResponse()
    async generateToken(dto: GenerateTokenDTO) {
        return await this.authService.generateToken(dto);
    }
}