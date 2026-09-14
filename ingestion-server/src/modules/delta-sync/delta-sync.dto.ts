import { ApiProperty } from "@nestjs/swagger";
import z from "zod";

export const deltaSyncSchema = z.object({
    modifiedSince: z.coerce.date(),
    projectId: z.uuid().trim(),
    limit: z.coerce.number().optional(),
});

type DeltaSyncType = z.infer<typeof deltaSyncSchema>;

export class DeltaSyncDTO implements DeltaSyncType {
    @ApiProperty({
        required: true,
        type: () => Date,
        description: 'Time of the last sync',
        example: '2026-05-10T00:00:00.000Z'
    })
    modifiedSince!: Date;

    @ApiProperty({
        required: true,
        type: () => String,
        description: 'Unique UUID of the project the data belongs to',
        example: 'a8b9c0d1-e2f3-4a5b-6c7d-8e9f0a1b2c3d'
    })
    projectId!: string;

    @ApiProperty({
        required: false,
        type: () => Number,
        description: 'Max number of event items returned',
        example: 5000
    })
    limit?: number;
}
