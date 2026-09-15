import { BadRequestException } from "@nestjs/common";
import { createInteractionEventBatchSchema, createInteractionEventSchema } from "./events.dto";
import { ZodValidationPipe } from "../../utils/zod.validation";
import { InteractionEventType } from "../../utils/enums";

describe('CreateInteractionEventSchema', () => {

    const validEvent = {
        projectId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        userId: 'user-1',
        itemId: 'item-42',
        eventType: InteractionEventType.CLICK,
        interactionValue: 1,
    };

    it('accepts valid event', () => {
        const result = createInteractionEventSchema.safeParse(validEvent);

        expect(result.success).toBe(true)
    });

    it('rejects when required field is missing', () => {
        const { userId, ...remainingFields } = validEvent;

        const result = createInteractionEventSchema.safeParse(remainingFields);
        expect(result.success).toBe(false);

        if(!result.success) {
            const isUserId = result.error.issues.map((i) => i.path.includes('userId'));
            expect(isUserId[0]).toBe(true);
        }
    })

    it('rejects when not valid eventType', () => {
        const result = createInteractionEventSchema.safeParse({
            ...validEvent,
            eventType: 'ufo'
        });
        expect(result.success).toBe(false);
    });

    it('rejects when projectId not UUID', () => {
        const result = createInteractionEventSchema.safeParse({
            ...validEvent,
            projectId: 'ufo-project-id'
        });
        expect(result.success).toBe(false)
    });

    it('rejects when interactionValue is not finite', () => {
        const result = createInteractionEventSchema.safeParse({
            ...validEvent,
            interactionValue: Infinity
        });
        expect(result.success).toBe(false)
    });
});

describe('CreateInteractionEventBatchSchema', () => {
    const validEvent = {
        events: [
             {
                projectId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                userId: 'user-1',
                itemId: 'item-42',
                eventType: InteractionEventType.CLICK,
                interactionValue: 1,
            }
        ]
    };

    it('accepts an array of valid events', () => {
        const result = createInteractionEventBatchSchema.safeParse(validEvent);
        expect(result.success).toBe(true);
    });

    it('rejects empty array', () => {
        expect(createInteractionEventBatchSchema.safeParse([]).success).toBe(false);
    });

    it('rejects array past the batch size cap', () => {
        const overSized = Array(501).fill(validEvent);
        expect(createInteractionEventBatchSchema.safeParse(overSized).success).toBe(false);
    });
})

describe('ZodValidationPipe', () => {
    const pipe = new ZodValidationPipe(createInteractionEventSchema);

    it('throws bad request exception for incomplete fields', () => {
        expect(() => pipe.transform({ userId: 'ufo' })).toThrow(BadRequestException);
    });

    it('returns the valid parsed events', () => {
        const valid = {
            events: [
                {
                    projectId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                    userId: 'user-1',
                    itemId: 'item-42',
                    eventType: InteractionEventType.CLICK,
                    interactionValue: 1,
                }
            ]
        };

        expect(createInteractionEventBatchSchema.safeParse(valid).data).toEqual(valid);
    });
});
