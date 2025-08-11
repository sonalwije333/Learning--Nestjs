import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/user/entities/user-role.entity';
import { Repository } from 'typeorm';


@Injectable()
export class UserRolesSeedService {
  constructor(
    @InjectRepository(UserRole)
    private readonly repository: Repository<UserRole>,
  ) {}

  async run() {
    const count = await this.repository.count();
    
    if (count === 0) {
      const roles = [
        { role_name: 'Admin' },
        { role_name: 'Pharmacist' },
        { role_name: 'Cashier' },
        { role_name: 'Customer' },
        { role_name: 'Supplier' },
      ];

      await this.repository.save(
        this.repository.create(roles),
      );
      console.log('User roles seeded successfully');
    }
  }
}