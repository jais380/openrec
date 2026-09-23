import { Body, Controller, Post, Query, Req, UnauthorizedException, UseGuards, UsePipes } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { ZodValidationPipe } from "../../utils/zod.validation";
import { AuthService } from "./auth.service";
import { GenerateTokenResponseDTO, generateTokenSchema, RegisterDTO, RegisterResponseDTO, registerSchema } from "./auth.dto";
import { JwtAuthGuard } from "../../utils/jwt-auth.guard";
import { AuthenticatedRequest } from "../../utils/jwt.strategy";

@Controller('api/auth')
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
    async generateToken(@Req() req: AuthenticatedRequest) {
        if(!req.header('x-api-key') && !req.header('x-api-secret')) {
            throw new UnauthorizedException("Access Denied");
        }

        const dto = { apiKey: req.header('x-api-key'), apiSecret: req.header('x-api-secret') }
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
