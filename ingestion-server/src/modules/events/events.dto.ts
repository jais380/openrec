import { ApiProperty } from "@nestjs/swagger";
import { InteractionEventType } from "../../utils/enums";
import z from "zod";

// SINGLE EVENT DATA

export const createInteractionEventSchema = z.object({
    projectId: z.uuid(),
    userId: z.string().trim().min(1),
    itemId: z.string().trim().min(1),
    eventType: z.enum(InteractionEventType),
    interactionValue: z.coerce.number().min(1).max(5),
});

export type CreateInteractionEventType = z.infer<typeof createInteractionEventSchema>;

export class CreateInteractionEventDTO implements CreateInteractionEventType {
    @ApiProperty({
        type: 'string',
        required: true,
        description: 'Unique UUID of the project',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    })
    projectId!: string;

    @ApiProperty({
        type: 'string',
        required: true,
        description: 'Unique ID of the user',
        example: 'user-1'
    })
    userId!: string;

    @ApiProperty({
        type: 'string',
        required: true,
        description: 'Unique ID of the item',
        example: '234489'
    })
    itemId!: string;

    @ApiProperty({
        type: 'string',
        enum: InteractionEventType,
        required: true,
        description: 'Type of event carried out by the user on the item'
    })
    eventType!: InteractionEventType;

    @ApiProperty({
        type: 'number',
        required: true,
        description: 'The alloted value/score assigned to the item',
        example: 5
    })
    interactionValue!: number;
}

// BATCH EVENT DATA
export const createInteractionEventBatchSchema = z.object({
    events: z.array(createInteractionEventSchema).min(1).max(500) // Cap batch size
});

export type CreateInteractionEventBatchType = z.infer<typeof createInteractionEventBatchSchema>;

export class CreateInteractionEventBatchDTO implements CreateInteractionEventBatchType {
    @ApiProperty({
        required: true,
        type: () => [CreateInteractionEventDTO],
        description: 'The batch list of Events'
    })
    events!: CreateInteractionEventDTO[]
}

// Event Response
export class InteractionEventResponse extends CreateInteractionEventDTO {
    @ApiProperty({
        type: 'string',
        required: true,
        description: 'Unique UUID of the interaction event entity',
        example: '9ds47f64-5717-4562-b3fc-2c963f66kjn5'
    })
    id!: string;

     @ApiProperty({
        type: () => Date,
        required: false,
        description: 'The timestamp for the created event - DB autocreates',
        example: '2026-06-07T14:30:00.000Z'
    })
    createdAt!: Date;

     @ApiProperty({
        type: () => Date,
        required: false,
        description: 'The timestamp for the modified event - DB autoupdates',
        example: '2026-06-07T14:30:00.000Z'
    })
    modifiedAt!: Date;

     @ApiProperty({
        type: () => Date || null,
        required: false,
        description: 'The timestamp for the deleted event - is Default NULL till softDelete',
        example: '2026-06-07T14:30:00.000Z'
    })
    deletedAt!: Date | null;
}
