import { Module } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule,HttpModule],
  controllers: [ProvidersController],
  providers: [ProvidersService],
})
export class ProvidersModule {
}
