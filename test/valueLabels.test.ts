// Copyright 2026 Mechatronics Academy
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

import { booleanMeaning } from "../src/lib/valueLabels";

describe("booleanMeaning", () => {
    it("spells out the safety pins in both directions", () => {
        expect(booleanMeaning("HW E-Stop user button", "True")).toBe("PRESSED");
        expect(booleanMeaning("HW E-Stop user button", "False")).toBe("RELEASED");
        expect(booleanMeaning("SW E-Stop latch status", "true")).toBe("ON");
        expect(booleanMeaning("SW E-Stop latch status", " FALSE ")).toBe("OFF");
    });

    it("labels nothing on a guess", () => {
        expect(booleanMeaning("Some other key", "True")).toBeNull();
        expect(booleanMeaning("HW E-Stop user button", "1")).toBeNull();
        expect(booleanMeaning("HW E-Stop user button", "")).toBeNull();
    });
});
