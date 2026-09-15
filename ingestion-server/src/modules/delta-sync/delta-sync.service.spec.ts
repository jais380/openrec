import { Test, TestingModule } from "@nestjs/testing";
import { InteractionEvent } from "../../entities/interaction-event.entity";
import { Repository } from "typeorm";
import { DeltaSyncService } from "./delta-sync.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { testDatabaseConfig } from "../../config/test-database-config";
import { entitiesList } from "../../utils/entity-list";
import { InteractionEventType } from "../../utils/enums";

describe('DeltaSyncService', () => {
    let testModule: TestingModule;
    let syncService: DeltaSyncService;
    let eventRepo: Repository<InteractionEvent>;

    let events: InteractionEvent[];

    beforeAll(async () => {
        testModule = await Test.createTestingModule({
            imports: [TypeOrmModule.forRoot({
                ...testDatabaseConfig,
                autoLoadEntities: true
            }),
            TypeOrmModule.forFeature(entitiesList)],
            providers: [DeltaSyncService]
        }).compile();

        syncService = testModule.get<DeltaSyncService>(DeltaSyncService);
        eventRepo = testModule.get<Repository<InteractionEvent>>('InteractionEventRepository');

        await setupTestData();
    });

    afterAll(async () => {
        await cleanTestData();
        await testModule.close();
    });

    async function cleanTestData() {
        const tableName = eventRepo.metadata.tableName;

        await eventRepo.query(`TRUNCATE TABLE ${tableName} CASCADE`);
    }

    async function setupTestData() {
        const validEvents = []

        const event = {
            projectId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            userId: 'user',
            itemId: 'item-42',
            eventType: InteractionEventType.CLICK,
            interactionValue: 1,
        }

        for(let i = 0; i < 10; i++) {
            validEvents.push({
                ...event,
                userId: `user-${i}`
            });
        }

        const results = validEvents.map((e) => {
            return eventRepo.create({
                projectId: e.projectId,
                userId: e.userId,
                itemId: e.itemId,
                eventType: e.eventType,
                interactionValue: e.interactionValue
            })
        });

        events = await eventRepo.save(results);
    }

    describe('Delta Sync', () => {
        const dto = {
            modifiedSince: new Date(),
            projectId: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
        }

        it('Returns no modified event', async () => {
            const result = await syncService.deltaSync({
                ...dto,
                modifiedSince: new Date(Date.now() + (30 * 60 * 1000))
            });

            expect(result.count).toBe(0);
            expect(result.data.length).toBe(0);
        });

        it('Fetches modified events', async () => {
            const result = await syncService.deltaSync(dto);

            expect(result.count).toBe(10);
        });

        it('Fetches only 5 events', async () => {
            const result = await syncService.deltaSync({
                ...dto,
                limit: 5
            });

            expect(result.count).toBe(5);
            expect(result.nextCursor.getTime()).toEqual(result.data[result.count - 1].modifiedAt.getTime());
        });
    });
});
