import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RecommendationBulkDTO } from "./recommendation.dto";
import { RecommendationPrediction } from "src/entities/recommendation-prediction.entity";

@Injectable()
export class RecommendationService {
    constructor(
        @InjectRepository(RecommendationPrediction)
        private readonly recommendatioRepo: Repository<RecommendationPrediction>
    ) {}

    async recordRecommendations(dto: RecommendationBulkDTO) {
        const recommendations: RecommendationPrediction[] = [];

        for(const recommendation of dto.recommendations) {
            const { projectId, userId, recommendedItemIds } = recommendation;

            const existingRecommendation = await this.recommendatioRepo.findOneBy({ projectId, userId });

            if(existingRecommendation) {
                existingRecommendation.recommendedItemIds = recommendedItemIds;
                recommendations.push(existingRecommendation);
            } else {
                const newRecommendation = this.recommendatioRepo.create({
                    projectId,
                    userId,
                    recommendedItemIds,
                });
                recommendations.push(newRecommendation);
            }
        }

        if(recommendations.length === 0) {
            return {
                message: 'Recommendations Recorded successfully',
                data: []
            }
        }

        const result = await this.recommendatioRepo.save(recommendations);

        return {
                message: 'Recommendations Recorded successfully',
                data: result
            }
    }

    async getRecommendation(userId: string) {
        const result = await this.recommendatioRepo.find({
            where: { userId }
        });

        return {
            message: 'Recommendations Fetched successfully',
            data: result,
        }
    }
}
