import type { Knex } from "knex";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const up = async (knex: Knex) => {
  await knex.schema.createTable("email_verification_tokens", (table) => {
    table.engine("InnoDB");
    table.charset("utf8mb4");

    table.increments("id");

    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.string("token_hash", 64).notNullable().unique();
    table.dateTime("expires_at").notNullable().index();
    table.dateTime("used_at").nullable();

    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex: Knex) => {
  await knex.schema.dropTable("email_verification_tokens");
};
