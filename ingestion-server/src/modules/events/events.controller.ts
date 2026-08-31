import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "src/utils/zod.validation";
import { CreateInteractionEventBatchType, CreateInteractionEventResponse, createInteractionEventBatchSchema } from "./events.dto";
import { InteractionEventService } from "./events.service";

@ApiTags('Interaction-Event')
@Controller('interation-event')
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
        type: () => [CreateInteractionEventResponse]
    })
    @ApiBadRequestResponse({
        description: 'Bad Request'
    })
    async createInterationEvent(@Body() body: CreateInteractionEventBatchType) {
        const events = Array.isArray(body) ? body : [body];
        return await this.eventService.createInteractionEvent(events);
    }
}
