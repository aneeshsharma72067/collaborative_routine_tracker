import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { MetaModule } from './meta/meta.module';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { RoutinesModule } from './routines/routines.module';
import { ActivityModule } from './activity/activity.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    HealthModule,
    MetaModule,
    UsersModule,
    GroupsModule,
    RoutinesModule,
    ActivityModule,
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
