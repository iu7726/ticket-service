import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrderTable1766127071223 implements MigrationInterface {
    name = 'CreateOrderTable1766127071223'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`user_id\` int NOT NULL, \`product_id\` int NOT NULL, \`quantity\` int NOT NULL, \`total_price\` decimal(10,2) NOT NULL, INDEX \`IDX_ac832121b6c331b084ecc4121f\` (\`product_id\`), INDEX \`IDX_fbfc1475fc6797244d160068cb\` (\`user_id\`, \`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_fbfc1475fc6797244d160068cb\` ON \`orders\``);
        await queryRunner.query(`DROP INDEX \`IDX_ac832121b6c331b084ecc4121f\` ON \`orders\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
    }

}
