import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoModule } from '../common/crypto/crypto.module';


@Module({
  imports: [TypeOrmModule.forFeature([]),
CryptoModule],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}