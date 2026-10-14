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

import { collapsedAfterModeChange, driveWidgetState } from "../src/lib/driveWidget";

describe("map drive widget", () => {
    it("is hidden on the Drive tab, which has the full joystick", () => {
        expect(driveWidgetState("drive", false)).toBe("hidden");
        expect(driveWidgetState("drive", true)).toBe("hidden");
    });

    it("follows the viewer's choice on the Navigate and Facility tabs", () => {
        expect(driveWidgetState("facility", false)).toBe("expanded");
        expect(driveWidgetState("navigate", true)).toBe("collapsed");
    });

    it("opens when mapping starts, and only then", () => {
        expect(collapsedAfterModeChange(true, false, true)).toBe(false);
        expect(collapsedAfterModeChange(true, true, true)).toBe(true); // collapsed again while mapping
        expect(collapsedAfterModeChange(true, true, false)).toBe(true);
        expect(collapsedAfterModeChange(false, true, false)).toBe(false);
    });
});
