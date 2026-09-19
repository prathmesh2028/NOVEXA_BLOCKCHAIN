import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaModule } from '../core/database/prisma.module';

// PrismaModule is explicitly imported here even though PrismaModule is @Global().
// Explicit imports are more resilient to future refactoring of the global scope.
@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
