import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InteractionEvent } from "src/entities/interaction-event.entity";
import { Repository } from "typeorm";
import { CreateInteractionEventBatchOnlyType } from "./events.dto";

@Injectable()
export class InteractionEventService {
    constructor(
        @InjectRepository(InteractionEvent)
        private readonly eventRepo: Repository<InteractionEvent>
    ) {}

    async createInteractionEvent(events: CreateInteractionEventBatchOnlyType) {
        const results = events.map((e) => {
            return this.eventRepo.create({
                projectId: e.projectId,
                userId: e.userId,
                itemId: e.itemId,
                eventType: e.eventType,
                interactionValue: e.interactionValue,
                ...(e.timestamp && {timestamp: e.timestamp})
            })
        });

        const data = await this.eventRepo.save(results);

        return {
            message: 'Event Created successfully',
            data: data
        }
    }
}