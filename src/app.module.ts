import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from './clients/clients.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: 'localhost', //config.get('DB_HOST'),
        port: 3306,
        //username: config.get('DB_USER'),
        username: config.get('u223416832_dream_info2'),
        //password: config.get('DB_PASS'),
        password: config.get('@Feedback3$'),
        //database: config.get('DB_NAME'),
        database: config.get('u223416832_dream_account2'),
        autoLoadEntities: true,
        synchronize: false, // ⚠️ production safe
      }),
    }),

    ClientsModule,
    PaymentsModule,
  ],
})
export class AppModule {}