import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RecommendationController } from "./recommendation.controller";
import { RecommendationService } from "./recommendation.service";
import { JwtStrategy } from "src/utils/jwt.strategy";
import { RecommendationPrediction } from "src/entities/recommendation-prediction.entity";

@Module({
    imports: [TypeOrmModule.forFeature([RecommendationPrediction])],
    controllers: [RecommendationController],
    providers: [RecommendationService, JwtStrategy],
    exports: [RecommendationService]
})
export class RecommendationModule {}
