import { Controller, Get, Query, UsePipes } from "@nestjs/common";
import { DeltaSyncService } from "./delta-sync.service";
import { ZodValidationPipe } from "../../utils/zod.validation";
import { DeltaSyncDTO, deltaSyncSchema } from "./delta-sync.dto";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { InteractionEventResponse } from "../events/events.dto";

@Controller('api/sync')
export class DeltaSyncController {
    constructor(
        private readonly syncService: DeltaSyncService
    ) {}

    @Get('delta')
    @UsePipes(new ZodValidationPipe(deltaSyncSchema))
    @ApiOperation({
        summary: 'Fetch latest modified data',
        description: 'Fetches the modified data from the timestamp provide for a particular project'
    })
    @ApiOkResponse({
        description: 'Modified Events Fetched successfully',
        type: () => [InteractionEventResponse]
    })
    async deltaSync(@Query() dto: DeltaSyncDTO) {
        return await this.syncService.deltaSync(dto);
    }
}