import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { TeamsModule } from './teams/teams.module';
import { RitualsModule } from './rituals/rituals.module';
import { RitualSessionsModule } from './ritual-sessions/ritual-sessions.module';
import { RitualResponsesModule } from './ritual-responses/ritual-responses.module';
import { SentimentModule } from './sentiment/sentiment.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ScheduleModule.forRoot(),
    UsersModule,
    WorkspacesModule,
    TeamsModule,
    RitualsModule,
    RitualSessionsModule,
    RitualResponsesModule,
    SentimentModule,
    DashboardModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    Logger.log('Database connected', 'TypeORM');
  }
}
