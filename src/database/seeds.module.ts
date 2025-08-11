import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from 'src/user/entities/user-role.entity';
import { UserRolesSeedService } from './user-role.seed';


@Module({
  imports: [TypeOrmModule.forFeature([UserRole])],
  providers: [UserRolesSeedService],
  exports: [UserRolesSeedService],
})
export class SeedsModule {}