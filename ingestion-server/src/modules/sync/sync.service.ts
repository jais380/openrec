import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InteractionEvent } from "src/entities/interaction-event.entity";
import { Repository } from "typeorm";
import { DeltaSyncDTO } from "./sync.dto";

@Injectable()
export class SyncService {
    constructor(
        @InjectRepository(InteractionEvent)
        private readonly eventRepo: Repository<InteractionEvent>
    ) {}

    async deltaSync(dto: DeltaSyncDTO) {
        const { projectId, modifiedSince } = dto;
        const [result, count] = await this.eventRepo.createQueryBuilder('event')
                        .where('projectId = :projectId', { projectId })
                        .andWhere('modifiedAt > :modifiedSince', { modifiedSince })
                        .getManyAndCount();

        return {
            message: 'Modified Events Fetched successfully',
            data: result,
            count
        }
    }
}