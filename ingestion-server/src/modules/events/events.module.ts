import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InteractionEvent } from "../../entities/interaction-event.entity";
import { RecommendationPrediction } from "../../entities/recommendation-prediction.entity";
import { InteractionEventController } from "./events.controller";
import { InteractionEventService } from "./events.service";
import { JwtStrategy } from "src/utils/jwt.strategy";

@Module({
    imports: [TypeOrmModule.forFeature([InteractionEvent, RecommendationPrediction])],
    controllers: [InteractionEventController],
    providers: [InteractionEventService, JwtStrategy],
    exports: [InteractionEventService]
})
export class InteractionEventModule {}
