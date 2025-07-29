import { Injectable } from '@nestjs/common';

export type User = {
  id: number;
  name: string;
  email: string;
  username: string;
  password: string;
};

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      id: 1,
      name: 'sonal',
      email: 'sonal@example.com',
      username: 'sonal',
      password: '1234',
    },
    {
      id: 2,
      name: 'minol',
      email: 'minol@example.com',
      username: 'minol',
      password: '1234',
    },
  ];

  // Example: Find a user by username
  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
