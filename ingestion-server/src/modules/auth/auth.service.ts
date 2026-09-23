import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/users.entity";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { GenerateTokenDTO, RegisterDTO } from "./auth.dto";
import { compareData, generateApiCredentials, hashData } from "src/utils/helper";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly user: Repository<User>,

        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDTO) {
        const { username, email, password, confirmPassword } = dto;

        //Reconfirm passwords
        if(password !== confirmPassword) {
            throw new BadRequestException("Passwords do not match");
        }

        const existingEmail = await this.user.existsBy({ email });

        const existingUsername = await this.user.existsBy({ username });

        if(existingEmail || existingUsername) {
            throw new ConflictException(
                `${existingEmail && existingUsername
                        ? 'Email and Username'
                        : existingEmail
                            ? 'Email'
                            : 'Username'} Already Exist`
            )
        }

        const saltRounds = 10;
        const { apiKey, apiSecret } = generateApiCredentials();

        const apiSecretHash = await hashData(apiSecret, saltRounds);
        const passwordHash = await hashData(password, saltRounds);

        const user =  this.user.create({
            username,
            email,
            passwordHash,
            apiKey,
            apiSecretHash
        });

        await this.user.save(user);

        return {
            message: "User Registered Successfully",
            warning: "Api Secret is shown only once - it is not saved in the database",
            data: { apiKey, apiSecret },
        }
    }

    async generateToken(dto: GenerateTokenDTO) {
        const { apiKey, apiSecret } = dto;

        const user = await this.user.findOneBy({ apiKey });
        if(!user) {
            throw new BadRequestException("Invalid Credentials");
        }

        const isMatch = await compareData(apiSecret, user.apiSecretHash);
        if(!isMatch) {
            throw new BadRequestException("Invalid Credentials");
        }

        const token = this.jwtService.sign(user.id);

        return {
            message: 'Token Generated Successfully',
            data: { token },
        };
    }
}