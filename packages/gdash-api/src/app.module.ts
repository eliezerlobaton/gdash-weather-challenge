import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WeatherModule } from './weather/weather.module';
import { MongodbModule } from './config/mongodb/mongodb.module';
import databaseConfig from './config/database.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      load: [databaseConfig],
    }),
    WeatherModule,
    UsersModule,
    AuthModule,
    MongodbModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
