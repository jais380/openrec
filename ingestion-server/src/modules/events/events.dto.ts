import { ApiProperty } from "@nestjs/swagger";
import { InteractionEventType } from "src/utils/enums";
import z from "zod";

// SINGLE EVENT DATA

export const createInteractionEventSchema = z.object({
    projectId: z.uuid(),
    userId: z.string().trim().min(1),
    itemId: z.string().trim().min(1),
    eventType: z.enum(InteractionEventType),
    interactionValue: z.coerce.number().min(1).max(5),
    timestamp: z.date().optional()
});

type CreateInteractionEventType = z.infer<typeof createInteractionEventSchema>;

export class CreateInteractionEventDTO implements CreateInteractionEventType {
    @ApiProperty({
        type: 'string',
        required: true,
        description: 'Unique UUID of the project',
        example: '4ua85f64-5717-4562-b3fc-2c963f66adb8'
    })
    projectId!: string;

    @ApiProperty({
        type: 'string',
        required: true,
        description: 'Unique ID of the user',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
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

    @ApiProperty({
        type: () => Date,
        required: false,
        description: 'The timestamp for the created event - DB autocreates if not provided',
        example: '2026-06-07T14:30:00.000Z'
    })
    timestamp?: Date;
}

// BATCH EVENT DATA
export const createInteractionEventBatchOnlySchema = z.array(createInteractionEventSchema).min(1).max(500); // Cap batch size

export type CreateInteractionEventBatchOnlyType = z.infer<typeof createInteractionEventBatchOnlySchema>;

export const createInteractionEventBatchSchema = z.union([
    createInteractionEventSchema,
    createInteractionEventBatchOnlySchema
]);

export type CreateInteractionEventBatchType = z.infer<typeof createInteractionEventBatchSchema>;

// Event Response
export class CreateInteractionEventResponse extends CreateInteractionEventDTO {
    @ApiProperty({
        type: 'string',
        required: true,
        description: 'Unique UUID of the interaction event entity',
        example: '9ds47f64-5717-4562-b3fc-2c963f66kjn5'
    })
    id!: string;
}
