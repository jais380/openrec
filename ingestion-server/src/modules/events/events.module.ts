import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InteractionEvent } from "src/entities/interaction-event.entity";
import { RecommendationPrediction } from "src/entities/recommendation-prediction.entity";

@Module({
    imports: [TypeOrmModule.forFeature([InteractionEvent, RecommendationPrediction])],
    controllers: [],
    providers: [],
    exports: []
})
export class EventModule {}
