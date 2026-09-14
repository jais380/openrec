import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InteractionEvent } from "src/entities/interaction-event.entity";
import { InteractionEventController } from "../events/events.controller";
import { InteractionEventService } from "../events/events.service";

@Module({
    imports: [TypeOrmModule.forFeature([InteractionEvent])],
    controllers: [InteractionEventController],
    providers: [InteractionEventService],
    exports: [InteractionEventService]
})
export class SyncModule {}
