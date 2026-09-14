import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database-config';
import { InteractionEventModule } from './modules/events/events.module';
import { DeltaSyncModule } from './modules/delta-sync/delta-sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRoot({ ...databaseConfig, autoLoadEntities: true }),
    InteractionEventModule,
    DeltaSyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
