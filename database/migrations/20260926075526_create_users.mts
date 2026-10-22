/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
import type { Knex } from "knex";
export const up = async (knex:Knex) => {
  await knex.schema.createTable("users", (table) => {
    table.engine("InnoDB");
    table.charset("utf8mb4");

    table.increments("id");
    table.string("name", 100).notNullable();
    table.string("email", 254).notNullable().unique();
    table.string("password_hash", 255).notNullable();

    table.dateTime("email_verified_at").nullable();

    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());

    table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex:Knex) => {
  await knex.schema.dropTable("users");
};
