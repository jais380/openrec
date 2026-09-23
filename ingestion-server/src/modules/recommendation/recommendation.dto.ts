import { ApiProperty } from "@nestjs/swagger";
import z from "zod";

export const recommendationSchema = z.object({
    projectId: z.uuid(),
    userId: z.string().trim().min(1),
    recommendedItemIds: z.array(z.object({
        itemId: z.string().trim().min(1),
        score: z.coerce.number().optional(),
    })).min(1),
});

type RecommendationType = z.infer<typeof recommendationSchema>;

export class RecommendedItems {
    @ApiProperty({
        type: 'string',
        required: true,
        description: 'Unique ID of the item',
        example: '234489'
    })
    itemId!: string;

    @ApiProperty({
        type: 'number',
        required: false,
        description: 'Confidence score of recommended items',
        example: 0.95
    })
    score?: number;
}

export class RecommendationDTO implements RecommendationType {
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
        type: 'array',
        required: true,
        description: 'Recommended items and their scores',
        example: [{ itemId: '234489', score: 0.95 }]
    })
    recommendedItemIds!: RecommendedItems[];
}

//Bulk
export const recommendationBulkSchema = z.object({
    recommendations: z.array(recommendationSchema).min(1),
});

type RecommendationBulkType = z.infer<typeof recommendationBulkSchema>;

export class RecommendationBulkDTO implements RecommendationBulkType {
    @ApiProperty({
        type: 'array',
        required: true,
        description: 'All Available Recommendations',
        example: [
            { projectId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', userId: 'user-1', recommendedItemIds: [{ itemId: '234489', score: 0.95 }] },
            { projectId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', userId: 'user-2', recommendedItemIds: [{ itemId: '234', score: 0.75 }, { itemId: '338', score: 0.90 }] }
        ]
    })
    recommendations: RecommendationDTO[];
}
