import { Controller, Get, Query, UsePipes } from "@nestjs/common";
import { SyncService } from "./sync.service";
import { ZodValidationPipe } from "src/utils/zod.validation";
import { DeltaSyncDTO, deltaSyncSchema } from "./sync.dto";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { InteractionEventResponse } from "../events/events.dto";

@Controller('api/sync')
export class SyncController {
    constructor(
        private readonly syncService: SyncService
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