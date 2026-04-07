import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSession1775536444492 implements MigrationInterface {
  name = 'CreateSession1775536444492';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`session\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`hashed_refresh_token\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`expires_at\` datetime NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`session\` ADD CONSTRAINT \`FK_30e98e8746699fb9af235410aff\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`session\` DROP FOREIGN KEY \`FK_30e98e8746699fb9af235410aff\``,
    );
    await queryRunner.query(`DROP TABLE \`session\``);
  }
}
