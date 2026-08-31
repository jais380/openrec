import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InteractionEvent } from "src/entities/interaction-event.entity";
import { RecommendationPrediction } from "src/entities/recommendation-prediction.entity";
import { InteractionEventController } from "./events.controller";

@Module({
    imports: [TypeOrmModule.forFeature([InteractionEvent, RecommendationPrediction])],
    controllers: [InteractionEventController],
    providers: [],
    exports: []
})
export class InteractionEventModule {}
