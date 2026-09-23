import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database-config';
import { InteractionEventModule } from './modules/events/events.module';
import { DeltaSyncModule } from './modules/delta-sync/delta-sync.module';
import { AuthModule } from './modules/auth/auth.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRoot({ ...databaseConfig, autoLoadEntities: true }),
    AuthModule,
    InteractionEventModule,
    DeltaSyncModule,
    RecommendationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
