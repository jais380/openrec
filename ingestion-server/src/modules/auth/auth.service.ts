import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/users.entity";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { GenerateTokenDTO, RegisterDTO } from "./auth.dto";
import { hashPassword } from "src/utils/helper";

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

        const passwordHash = await hashPassword(password);

        const user =  this.user.create({
            username,
            email,
            passwordHash,
        });

        await this.user.save(user);
    }

    async generateToken(dto: GenerateTokenDTO) {
        const token = this.jwtService.sign(dto);

        return { token };
    }
}