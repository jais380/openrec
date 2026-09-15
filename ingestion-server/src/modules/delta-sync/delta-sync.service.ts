import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InteractionEvent } from "../../entities/interaction-event.entity";
import { Repository } from "typeorm";
import { DeltaSyncDTO } from "./delta-sync.dto";

@Injectable()
export class DeltaSyncService {
    constructor(
        @InjectRepository(InteractionEvent)
        private readonly eventRepo: Repository<InteractionEvent>
    ) {}

    async deltaSync(dto: DeltaSyncDTO) {
        const { projectId, modifiedSince, limit = 5000 } = dto;
        const items = await this.eventRepo.createQueryBuilder('event')
                        .withDeleted()
                        .where('event.projectId = :projectId', { projectId })
                        .andWhere('event.modifiedAt > :modifiedSince', { modifiedSince })
                        .orderBy('event.modifiedAt', 'ASC')
                        .addOrderBy('event.id', 'ASC')
                        .take(limit)
                        .getMany();

        return {
            message: 'Modified Events Fetched successfully',
            data: items,
            count: items.length,
            nextCursor: items.length > 0 ? items[items.length - 1].modifiedAt : null,
        }
    }
}
