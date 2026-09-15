import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InteractionEvent } from "../../entities/interaction-event.entity";
import { Repository } from "typeorm";
import { CreateInteractionEventBatchDTO } from "./events.dto";

@Injectable()
export class InteractionEventService {
    constructor(
        @InjectRepository(InteractionEvent)
        private readonly eventRepo: Repository<InteractionEvent>
    ) {}

    async createInteractionEvent(dto: CreateInteractionEventBatchDTO) {

        const results = dto.events.map((e) => {
            return this.eventRepo.create({
                projectId: e.projectId,
                userId: e.userId,
                itemId: e.itemId,
                eventType: e.eventType,
                interactionValue: e.interactionValue
            })
        });

        const data = await this.eventRepo.save(results);

        return {
            message: 'Event Created successfully',
            data: data
        }
    }
}