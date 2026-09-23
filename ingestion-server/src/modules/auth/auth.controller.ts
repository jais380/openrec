import { Body, Controller, Post, Query, Req, UseGuards, UsePipes } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { ZodValidationPipe } from "../../utils/zod.validation";
import { AuthService } from "./auth.service";
import { GenerateTokenDTO, GenerateTokenResponseDTO, generateTokenSchema, RegisterDTO, RegisterResponseDTO, registerSchema } from "./auth.dto";
import { JwtAuthGuard } from "../../utils/jwt-auth.guard";
import { AuthenticatedRequest } from "../../utils/jwt.strategy";

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
    @ApiBadRequestResponse({
        description: "Bad Request"
    })
    async register(@Body() dto: RegisterDTO) {
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
    @ApiBadRequestResponse({
        description: "Bad Request"
    })
    async generateToken(@Query() dto: GenerateTokenDTO) {
        return await this.authService.generateToken(dto);
    }

    @Post('keys/regenerate')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Regenerate APIKEY and APISECRET',
    })
    @ApiOkResponse({
        description: "Keys Regenerated Successfully",
        type: RegisterResponseDTO
    })
    @ApiBadRequestResponse({
        description: "Bad Request"
    })
    async regenerateKeys(@Req() req: AuthenticatedRequest) {
        return await this.authService.regenerateKeys(req.user.id);
    }
}
