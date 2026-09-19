import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { PrismaModule } from '../core/database/prisma.module';

// PrismaModule is explicitly imported here even though PrismaModule is @Global().
// Explicit imports are more resilient to future refactoring of the global scope.
@Module({
  imports: [PrismaModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
