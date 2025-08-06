import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import {PrismaModule} from "@/common/prisma/prisma.module";
import {ModelUsageService} from "@/model-usage/model-usage.service";

@Module({
  imports:[PrismaModule],
  controllers: [DashboardController],
  providers: [DashboardService,ModelUsageService],
})
export class DashboardModule {}
