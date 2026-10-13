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

import { parseConfig } from "../src/config";
import { nsFrame, nsName, sanitizeNamespace } from "../src/lib/namespace";
import { batteryPercent, needsRecovery, safetyBadge, summarizeSafety, worstDiagnosticLevel } from "../src/lib/status";

const okStatus = {
    hw_e_stop_user_button: false,
    motor_contactor_engaged: true,
    latch_active: false,
    latch_cause: 0,
    link_healthy: true,
};
const okEcho = { sw_e_stop_user_button: false, sw_e_stop_motor_driver_fault: false };

describe("status", () => {
    it("ranks diagnostics ERROR > STALE > WARN > OK", () => {
        expect(worstDiagnosticLevel([])).toBe("unknown");
        expect(worstDiagnosticLevel([{ level: 0 }, { level: 1 }])).toBe("warn");
        expect(worstDiagnosticLevel([{ level: 3 }, { level: 1 }])).toBe("stale");
        expect(worstDiagnosticLevel([{ level: 3 }, { level: 2 }])).toBe("error");
    });

    it("converts BatteryState.percentage", () => {
        expect(batteryPercent(0.734)).toBe(73);
        expect(batteryPercent(NaN)).toBeNull();
        expect(batteryPercent(undefined)).toBeNull();
    });

    it("summarizes safety with e-stops before latch before lock", () => {
        expect(summarizeSafety(null, null, null).level).toBe("unknown");
        expect(summarizeSafety(okStatus, okEcho, false).level).toBe("ok");
        expect(summarizeSafety({ ...okStatus, hw_e_stop_user_button: true, latch_active: true }, okEcho, true).label)
                .toBe("E-STOP (HW)");
        expect(summarizeSafety(okStatus, { ...okEcho, sw_e_stop_user_button: true }, true).label).toBe("E-STOP (SW)");
        expect(summarizeSafety({ ...okStatus, latch_active: true, latch_cause: 3 }, okEcho, true).detail).toContain("watchdog");
        expect(summarizeSafety(okStatus, okEcho, true).label).toBe("Motion locked");
    });
});

describe("namespace and config", () => {
    it("builds names and frames", () => {
        expect(sanitizeNamespace("isaacbot")).toBe("/isaacbot");
        expect(sanitizeNamespace("/9ro-ver//")).toBe("/isaacbot");
        expect(nsName("/isaacbot", "/scan")).toBe("/isaacbot/scan");
        expect(nsName("", "scan")).toBe("/scan");
        expect(nsFrame("/isaacbot", "base_link")).toBe("isaacbot/base_link");
        expect(nsFrame("", "map")).toBe("map");
    });

    it("parses config with fallbacks", () => {
        const c = parseConfig({ namespace: "isaacbot", maxLinear: -1, robotName: "" });
        expect(c.namespace).toBe("/isaacbot");
        expect(c.maxLinear).toBe(1.0);
        expect(c.robotName).toBe("isaacbot");
    });
});

describe("safety recovery", () => {
    it("asks for a reset on warn and error, not when ready or unknown", () => {
        const s = (level: "ok" | "warn" | "error" | "unknown" | "stale", label = "x") => ({ level, label, detail: "" });
        expect(needsRecovery(s("ok"))).toBe(false);
        expect(needsRecovery(s("unknown"))).toBe(false);
        expect(needsRecovery(s("warn"))).toBe(true);
        expect(needsRecovery(s("error"))).toBe(true);
        expect(safetyBadge(s("error", "E-STOP (SW)"))).toBe("E-STOP");
        expect(safetyBadge(s("warn", "Latched"))).toBe("LATCHED");
    });
});
