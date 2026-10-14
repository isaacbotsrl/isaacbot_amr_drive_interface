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

import { describe, expect, it } from "vitest";

import { findMe } from "../src/lib/relocalize";

describe("find me", () => {
    it("reinitializes globally, then forces nomotion updates", async () => {
        const calls: string[] = [];
        await findMe({ call: async (s) => { calls.push(s) }, sleep: async () => {} }, 3, 0);
        expect(calls).toEqual([
            "reinitialize_global_localization",
            "request_nomotion_update",
            "request_nomotion_update",
            "request_nomotion_update",
        ]);
    });

    it("stops at the first failure", async () => {
        const calls: string[] = [];
        const call = async (s: string) => {
            calls.push(s);
            if (s === "reinitialize_global_localization") throw new Error("AMCL not running");
        };
        await expect(findMe({ call, sleep: async () => {} })).rejects.toThrow("AMCL not running");
        expect(calls).toEqual(["reinitialize_global_localization"]);
    });
});
