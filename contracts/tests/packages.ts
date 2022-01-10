/**
 * Used the same way as package.json, that way all the files
 * use the same version of these packages.
 */
export {
  Clarinet,
  Tx,
  Chain,
  types,
} from "https://deno.land/x/clarinet@v0.23.0/index.ts";
export type { Account } from "https://deno.land/x/clarinet@v0.23.0/index.ts";
export {
  assert,
  assertEquals,
} from "https://deno.land/std@0.112.0/testing/asserts.ts";
