import { defineConfig } from "vitest/config";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default defineConfig({
  test: {
    fileParallelism: false,
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
});