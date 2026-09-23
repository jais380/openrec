import { Body, Controller, Get, Param, Post, Query, UseGuards, UsePipes } from "@nestjs/common";
import { RecommendationService } from "./recommendation.service";
import { ZodValidationPipe } from "../../utils/zod.validation";
import { RecommendationBulkDTO, recommendationBulkSchema } from "./recommendation.dto";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../utils/jwt-auth.guard";

@ApiTags('Recommendations')
@Controller('api/recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationController {
    constructor(
        private readonly recommendationService: RecommendationService
    ) {}

    @Post('bulk')
    @UsePipes(new ZodValidationPipe(recommendationBulkSchema))
    @ApiOperation({
        summary: 'Record recommended data',
        description: 'Records the recommended data for a user of a particular project'
    })
    @ApiOkResponse({
        description: 'Recommendations Recorded successfully',
    })
    async recordRecommendations(@Body() dto: RecommendationBulkDTO) {
        return await this.recommendationService.recordRecommendations(dto);
    }

    @Get(':userId')
    @ApiOperation({
        summary: 'Fetches recommended data',
        description: 'Fetches the recommended data for a user of a particular project'
    })
    @ApiOkResponse({
        description: 'Recommendations Fetched successfully',
    })
    async getRecommendation(@Param('userId') userId: string) {
        return await this.recommendationService.getRecommendation(userId);
    }
}
