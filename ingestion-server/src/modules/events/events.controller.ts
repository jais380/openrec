import { Body, Controller, Post, UseGuards, UsePipes } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "../../utils/zod.validation";
import { CreateInteractionEventBatchDTO, InteractionEventResponse, createInteractionEventBatchSchema } from "./events.dto";
import { InteractionEventService } from "./events.service";
import { JwtAuthGuard } from "../../utils/jwt-auth.guard";

@ApiTags('Interaction Event')
@Controller('api/events')
@UseGuards(JwtAuthGuard)
export class InteractionEventController {
    constructor(
        private readonly eventService: InteractionEventService
    ) {}

    @Post()
    @UsePipes(new ZodValidationPipe(createInteractionEventBatchSchema))
    @ApiOperation({
        summary: 'Create new single or batch interation events',
        description: 'Singular endpoint to create either a single object event entry or an array of object event entries'
    })
    @ApiOkResponse({
        description: 'Event Created successfully',
        type: () => [InteractionEventResponse]
    })
    @ApiBadRequestResponse({
        description: 'Bad Request'
    })
    async createInterationEvent(@Body() body: CreateInteractionEventBatchDTO) {
        return await this.eventService.createInteractionEvent(body);
    }
}
