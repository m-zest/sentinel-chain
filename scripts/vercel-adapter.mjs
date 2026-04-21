#!/usr/bin/env node
// Adapts the Vite / TanStack Start build output to Vercel's Build Output API v3.
// See: https://vercel.com/docs/build-output-api/v3

import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const distClient = join(root, "dist", "client");
const distServer = join(root, "dist", "server");
const outputRoot = join(root, ".vercel", "output");
const outputStatic = join(outputRoot, "static");
const outputFunction = join(outputRoot, "functions", "index.func");

if (!existsSync(distClient) || !existsSync(distServer)) {
  console.error(
    "[vercel-adapter] dist/client or dist/server not found. Run `npm run build` first.",
  );
  process.exit(1);
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputStatic, { recursive: true });
await mkdir(outputFunction, { recursive: true });

await cp(distClient, outputStatic, { recursive: true });
await cp(distServer, outputFunction, { recursive: true });

const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };

await writeFile(
  join(outputFunction, "package.json"),
  JSON.stringify({ type: "module", dependencies: deps }, null, 2),
);

await writeFile(
  join(outputFunction, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "server.js",
      launcherType: "Nodejs",
      shouldAddHelpers: false,
      supportsResponseStreaming: true,
    },
    null,
    2,
  ),
);

await writeFile(
  join(outputRoot, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: "filesystem" },
        { src: "/(.*)", dest: "/index" },
      ],
    },
    null,
    2,
  ),
);

console.log("[vercel-adapter] Build output written to .vercel/output/");
