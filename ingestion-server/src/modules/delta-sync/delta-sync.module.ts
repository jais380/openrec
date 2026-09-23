import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InteractionEvent } from "../../entities/interaction-event.entity";
import { DeltaSyncController } from "./delta-sync.controller";
import { DeltaSyncService } from "./delta-sync.service";
import { JwtStrategy } from "src/utils/jwt.strategy";

@Module({
    imports: [TypeOrmModule.forFeature([InteractionEvent])],
    controllers: [DeltaSyncController],
    providers: [DeltaSyncService, JwtStrategy],
    exports: [DeltaSyncService]
})
export class DeltaSyncModule {}
