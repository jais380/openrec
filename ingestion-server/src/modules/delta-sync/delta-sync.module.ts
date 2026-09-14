import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InteractionEvent } from "src/entities/interaction-event.entity";
import { DeltaSyncController } from "./delta-sync.controller";
import { DeltaSyncService } from "./delta-sync.service";

@Module({
    imports: [TypeOrmModule.forFeature([InteractionEvent])],
    controllers: [DeltaSyncController],
    providers: [DeltaSyncService],
    exports: [DeltaSyncService]
})
export class DeltaSyncModule {}
