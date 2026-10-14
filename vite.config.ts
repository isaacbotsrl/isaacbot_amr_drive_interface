// Copyright 2026 IsaacBot
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/// <reference types="vitest/config" />
import { readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// Minification drops every source header, including the LGPL notices of src/ros/ and
// src/lib/diagnostics.ts, so the license texts ship next to the bundle in dist/licenses/.
// .txt so nginx serves them as text/plain instead of a download.
function licenseFiles(): Plugin {
    const files: Record<string, string> = {
        "licenses/LICENSE.txt": "./LICENSE",
        "licenses/COPYING.LESSER.txt": "./src/ros/COPYING.LESSER",
        "licenses/NOTICE.txt": "./src/ros/NOTICE.md",
    };
    return {
        name: "isaacbot-license-files",
        apply: "build",
        generateBundle() {
            for (const [fileName, path] of Object.entries(files)) {
                const source = readFileSync(new URL(path, import.meta.url), "utf8");
                this.emitFile({ type: "asset", fileName, source });
            }
        },
    };
}

// In development the page is served by Vite instead of nginx, so Vite plays nginx's
// role and proxies /ws to foxglove_bridge. Point it at a isaacbot with
// ISAACBOT_AMR_BRIDGE=ws://<isaacbot-ip>:8765 npm run dev.
const bridge = process.env.ISAACBOT_AMR_BRIDGE ?? "ws://127.0.0.1:8765";

export default defineConfig({
    plugins: [react(), licenseFiles()],
    server: {
        port: 5000,
        proxy: {
            "/ws": { target: bridge, ws: true, rewrite: () => "/" },
        },
    },
    test: {
        include: ["test/**/*.test.ts"],
        environment: "node",
    },
});
