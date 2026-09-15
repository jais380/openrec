import { Test, TestingModule } from "@nestjs/testing"
import { InteractionEventService } from "./events.service";
import { Repository } from "typeorm";
import { InteractionEvent } from "../../entities/interaction-event.entity";
import { RecommendationPrediction } from "../../entities/recommendation-prediction.entity";
import { testDatabaseConfig } from "../../config/test-database-config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InteractionEventModule } from "./events.module";
import { entitiesList } from "../../utils/entity-list";
import { InteractionEventType } from "../../utils/enums";

describe('EventService', () => {
    let testModule: TestingModule;
    let eventService: InteractionEventService;
    let eventRepo: Repository<InteractionEvent>;
    let recommendationRepo: Repository<RecommendationPrediction>;

    beforeAll(async () => {
        testModule = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    ...testDatabaseConfig,
                    autoLoadEntities: true
                }),
                TypeOrmModule.forFeature(entitiesList),
                InteractionEventModule
            ],
            providers: [InteractionEventService]
        }).compile();

        eventService = testModule.get<InteractionEventService>(InteractionEventService);
        eventRepo = testModule.get<Repository<InteractionEvent>>('InteractionEventRepository');
        recommendationRepo = testModule.get<Repository<RecommendationPrediction>>('RecommendationPredictionRepository');
    });

    afterAll(async () => {
        await clearTestData();
        await testModule.close();
    });

    async function clearTestData() {
        const repos = [eventRepo, recommendationRepo];

        for (const repo of repos) {
            const tableName = repo.metadata.tableName;
            await repo.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
        }
    };

    describe('CreateInteractionEvent', () => {
        const validEvents = {
            events: [{
                projectId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                userId: 'user-1',
                itemId: 'item-42',
                eventType: InteractionEventType.CLICK,
                interactionValue: 1,
            }, {
                projectId: '8aa85f64-5717-4562-b3fc-2c963f66abd2',
                userId: 'user-2',
                itemId: 'item-56',
                eventType: InteractionEventType.PURCHASE,
                interactionValue: 5,
            }]
        };

        it('Creates interation events matching the input', async () => {
            const events = await eventService.createInteractionEvent(validEvents);

            const results = events.data;

            for(let i = 0; i < results.length; i++) {
                expect(results[i].projectId).toEqual(validEvents.events[i].projectId);
                expect(results[i].userId).toEqual(validEvents.events[i].userId);
                expect(results[i].itemId).toEqual(validEvents.events[i].itemId);
                expect(results[i].eventType).toEqual(validEvents.events[i].eventType);
                expect(results[i].interactionValue).toEqual(validEvents.events[i].interactionValue);
            }
        });
    });
})