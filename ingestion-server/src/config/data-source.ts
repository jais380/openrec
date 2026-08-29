import { DataSource } from 'typeorm';
import databaseConfig from './database-config';
import { InteractionEvent } from 'src/entities/interaction-event.entity';
import { RecommendationPrediction } from 'src/entities/recommendation-prediction.entity';

export const AppDataSource = new DataSource({
    ...databaseConfig,
    entities: [InteractionEvent, RecommendationPrediction]
});
