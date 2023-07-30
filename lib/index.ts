import { join } from "node:path";
import { rm } from "node:fs/promises";
import { copy, json, pkg, type Skeleton } from "code-skeleton";

interface Variables {
  dogfood?: boolean;
  library?: boolean;
}

export default async function (root: string, variables: Variables) {
  const csBin = variables.dogfood ? "./bin/code-skeleton.js" : "code-skeleton";
  const skeleton: Skeleton = {
    "package.json": pkg({
      "//": "This file is partially managed by code-skeleton. Changes may be overwritten.",
      main: "lib/index.js",
      files: {
        append: [
          "bin/**/*.js",
          "lib/**/*.js",
          "lib/**/*.d.ts",
          "!lib/types/**",
        ],
      },
      scripts: {
        clean: "./scripts/clean.ts",
        prelint: "tsc --noEmit",
        lint: "eslint .",
        postlint: "npm run skeleton:verify",
        test: "tap",
        posttest: "npm run lint",
        prepack: "tsc --project tsconfig.build.json",
        "skeleton:apply": `${csBin} apply`,
        "skeleton:verify": `${csBin} verify`,
      },
      tap: {
        coverage: true,
        ts: true,
      },
      types: "lib/index.d.ts",
      devDependencies: {
        "@tsconfig/node18": "^2.0.0",
        "@types/node": "^18.0.0",
        "@types/tap": "^15.0.0",
        "@typescript-eslint/eslint-plugin": "^5.0.0",
        "@typescript-eslint/parser": "^5.0.0",
        "eslint": "^8.0.0",
        "tap": "^16.0.0",
        "ts-node": "^10.0.0",
        "typescript": "^5.0.0"
      },
    }),
    "tsconfig.json": json({
      set: {
        "//": "This file is partially managed by code-skeleton. Changes may be overwritten.",
        extends: "@tsconfig/node18/tsconfig.json",
      },
      append: {
        include: [
          "**/*.ts",
          ".eslintrc.js",
        ],
        "compilerOptions.typeRoots": [
          "./node_modules/@types",
          "./lib/types",
        ],
      },
    }),
    "tsconfig.build.json": json({
      set: {
        "//": "This file is partially managed by code-skeleton. Changes may be overwritten.",
        extends: "./tsconfig.json",
        "compilerOptions.declaration": true,
      },
      append: {
        exclude: [
          "./scripts/**",
          "./test/**",
        ],
      },
    }),
    ".eslintrc.js": copy(join(__dirname, "content", "eslintrc.js")),
    ".gitignore": copy(join(__dirname, "content", "gitignore")),
    "scripts/clean.ts": copy(join(__dirname, "content", "clean.ts")),
    ".github/workflows/ci.yml": copy(join(__dirname, "content", "ci.yml")),
    ".github/matchers/tap.json": copy(join(__dirname, "content", "tap.json")),
  };

  if (variables.library) {
    await rm(join(root, "package-lock.json"), { force: true });
    skeleton[".npmrc"] = copy(join(__dirname, "content", "npmrc"));
  }

  return skeleton;
}