import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InteractionEvent } from "../../entities/interaction-event.entity";
import { RecommendationPrediction } from "../../entities/recommendation-prediction.entity";
import { InteractionEventController } from "./events.controller";
import { InteractionEventService } from "./events.service";

@Module({
    imports: [TypeOrmModule.forFeature([InteractionEvent, RecommendationPrediction])],
    controllers: [InteractionEventController],
    providers: [InteractionEventService],
    exports: [InteractionEventService]
})
export class InteractionEventModule {}
