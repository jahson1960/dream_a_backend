import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ClientsService } from './clients.service';
import { RegisterDto } from './dto/register.dto';
import { ApiKeyGuard } from '../common/guards/api-key/api-key.guard';

@Controller('clients')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  // =========================
  // REGISTER
  // =========================
  @Post('register')
  @UseGuards(ApiKeyGuard)
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.service.register(dto, req);
  }

  // =========================
  // LIST CLIENTS (PAGINATED)
  // =========================
 @Post('list')
@UseGuards(ApiKeyGuard)
async listClients(@Body() body: { limit?: number; offset?: number }) {
  return this.service.listClients(
    body.limit ?? 20,
    body.offset ?? 0,
  );
}

  // =========================
  // SEARCH BY ACCOUNT NUMBER
  // =========================
  @Post('search/account')
  @UseGuards(ApiKeyGuard)
  async findByAccountNumber(
    @Body('account_number') account_number: string
  ) {
    return this.service.findByAccountNumber(account_number);
  }

  // =========================
  // SEARCH BY EMAIL
  // =========================
  @Post('search/email')
  @UseGuards(ApiKeyGuard)
  async findByEmail(
    @Body('email') email: string
  ) {
    return this.service.findByEmail(email);
  }

  // =========================
  // SEARCH BY USERNAME
  // =========================
  @Post('search/username')
  @UseGuards(ApiKeyGuard)
  async findByUsername(
    @Body('username') username: string,
  ) {
    return this.service.findByUsername(username);
  }

  // =========================
  // SEARCH BY LAST NAME
  // =========================
  @Post('search/lastname')
  @UseGuards(ApiKeyGuard)
  async findByLastName(
    @Body('last_name') last_name: string,
  ) {
    return this.service.findByLastName(last_name);
  }
}



/*import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ClientsService } from './clients.service';
import { RegisterDto } from './dto/register.dto';
import { ApiKeyGuard } from '../common/guards/api-key/api-key.guard';

@Controller('clients')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Post('register')
  @UseGuards(ApiKeyGuard)
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.service.register(dto, req);
  }
}*/
