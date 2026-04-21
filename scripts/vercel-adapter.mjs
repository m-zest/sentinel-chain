#!/usr/bin/env node
// Adapts the Vite / TanStack Start build output to Vercel's Build Output API v3.
// The SSR server is bundled (deps inlined) with esbuild because v3 function
// directories are deployed as-is — no `npm install` happens inside them.
// See: https://vercel.com/docs/build-output-api/v3

import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { build } from "esbuild";

const root = resolve(process.cwd());
const distClient = join(root, "dist", "client");
const distServer = join(root, "dist", "server");
const outputRoot = join(root, ".vercel", "output");
const outputStatic = join(outputRoot, "static");
const outputFunction = join(outputRoot, "functions", "index.func");

if (!existsSync(distClient) || !existsSync(distServer)) {
  console.error(
    "[vercel-adapter] dist/client or dist/server not found. Run `vite build` first.",
  );
  process.exit(1);
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputStatic, { recursive: true });
await mkdir(outputFunction, { recursive: true });

// 1. Static assets — served by Vercel's edge/CDN.
await cp(distClient, outputStatic, { recursive: true });

// 2. Wrapper that adapts TanStack Start's `{ fetch }` default export to the
//    Node.js (req, res) signature Vercel's Nodejs launcher invokes.
const wrapperSource = `
import { Readable } from "node:stream";
import serverEntry from "./server.js";

export default async function handler(req, res) {
  try {
    const host = req.headers.host || "localhost";
    const proto = req.headers["x-forwarded-proto"] || "https";
    const url = \`\${proto}://\${host}\${req.url}\`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) headers.set(key, value.join(", "));
      else headers.set(key, String(value));
    }

    const hasBody = !["GET", "HEAD"].includes(req.method);
    const request = new Request(url, {
      method: req.method,
      headers,
      body: hasBody ? Readable.toWeb(req) : undefined,
      duplex: "half",
    });

    const response = await serverEntry.fetch(request);

    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (response.body) {
      Readable.fromWeb(response.body).pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    console.error("[ssr-handler] unhandled error:", err);
    if (!res.headersSent) res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
`;

const wrapperInput = join(distServer, "__vercel_handler.mjs");
await writeFile(wrapperInput, wrapperSource);

// 3. Bundle wrapper + server.js + dynamic route chunks + all deps into a
//    single self-contained ESM file.
await build({
  entryPoints: [wrapperInput],
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  outfile: join(outputFunction, "index.mjs"),
  banner: {
    js: [
      "import { createRequire as __createRequire } from 'node:module';",
      "const require = __createRequire(import.meta.url);",
    ].join("\n"),
  },
  legalComments: "none",
  logLevel: "warning",
});

await rm(wrapperInput, { force: true });

// 4. Function config — Node 22, streaming responses enabled.
await writeFile(
  join(outputFunction, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      shouldAddHelpers: false,
      supportsResponseStreaming: true,
    },
    null,
    2,
  ),
);

await writeFile(
  join(outputFunction, "package.json"),
  JSON.stringify({ type: "module" }, null, 2),
);

// 5. Top-level routing: serve static files first, fall through to SSR.
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
