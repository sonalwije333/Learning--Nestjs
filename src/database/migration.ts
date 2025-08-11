import { Role } from 'src/shared/enums/role.enum';
import { MigrationInterface, QueryRunner } from 'typeorm';


export class SeedUserRoles1690000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const role of Object.values(Role)) {
      await queryRunner.query(
        `INSERT INTO "user_role" ("role_name") VALUES ('${role}') ON CONFLICT DO NOTHING`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "user_role"`);
  }
}