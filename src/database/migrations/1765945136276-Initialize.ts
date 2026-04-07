import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initialize1765945136276 implements MigrationInterface {
  name = 'Initialize1765945136276';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`created_by\` varchar(255) NOT NULL DEFAULT 'SYSTEM', \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`updated_by\` varchar(255) NOT NULL DEFAULT 'SYSTEM', \`deleted_at\` datetime(6) NULL, \`deleted_by\` varchar(255) NULL, \`email\` varchar(255) NOT NULL, \`hashed_password\` varchar(255) NOT NULL, \`first_name\` varchar(255) NOT NULL, \`last_name\` varchar(255) NOT NULL, \`roles\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
