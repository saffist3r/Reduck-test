import { defineConfig } from "vitest/config";
import { mkdirSync } from "node:fs";

mkdirSync("test-results", { recursive: true });

export default defineConfig({
  test: {
    include: [
      "tests/**/*.test.js",
      "../../scripts/*/tests/**/*.test.js",
    ],
    reporters: ["default", "junit", "html", "./lib/markdownReporter.js"],
    outputFile: {
      junit: "test-results/junit.xml",
      html: "test-results/index.html",
    },
    testTimeout: 15_000,
  },
});
