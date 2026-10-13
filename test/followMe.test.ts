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

import { DRIVE_MODE } from "../src/lib/driveMode";
import {
    followLevel,
    followStartBlockedReason,
    isFollowing,
    parseFollowStatus,
} from "../src/lib/followMe";

describe("parseFollowStatus", () => {
    it("splits phase and detail", () => {
        expect(parseFollowStatus("FOLLOWING: at following distance"))
            .toEqual({ phase: "FOLLOWING", detail: "at following distance" });
        expect(parseFollowStatus("IDLE: following ended: FAILED_TO_DETECT_OBJECT: lost detection"))
            .toEqual({ phase: "IDLE", detail: "following ended: FAILED_TO_DETECT_OBJECT: lost detection" });
        expect(parseFollowStatus("SEARCHING")).toEqual({ phase: "SEARCHING", detail: "" });
        expect(parseFollowStatus("WAITING: person lost; stopped, waiting for them to come back"))
            .toEqual({ phase: "WAITING", detail: "person lost; stopped, waiting for them to come back" });
    });

    it("treats nothing or garbage as unknown", () => {
        expect(parseFollowStatus(null).phase).toBe("UNKNOWN");
        expect(parseFollowStatus("").phase).toBe("UNKNOWN");
        expect(parseFollowStatus("hello: world")).toEqual({ phase: "UNKNOWN", detail: "hello: world" });
    });
});

describe("phases", () => {
    it("knows which phases have a goal out", () => {
        expect(isFollowing("STARTING")).toBe(true);
        expect(isFollowing("FOLLOWING")).toBe(true);
        expect(isFollowing("SEARCHING")).toBe(true);
        expect(isFollowing("WAITING")).toBe(true);
        expect(isFollowing("STOPPING")).toBe(false);
        expect(isFollowing("IDLE")).toBe(false);
    });

    it("colours following ok, searching and transitions warn, idle grey", () => {
        expect(followLevel("FOLLOWING")).toBe("ok");
        expect(followLevel("SEARCHING")).toBe("warn");
        expect(followLevel("WAITING")).toBe("warn");
        expect(followLevel("IDLE")).toBe("unknown");
    });
});

describe("followStartBlockedReason", () => {
    const auto = DRIVE_MODE.AUTOMATIC;

    it("allows start in Automatic with no mission", () => {
        expect(followStartBlockedReason(true, "IDLE", auto, false)).toBeNull();
    });

    it("explains every refusal the page can see", () => {
        expect(followStartBlockedReason(false, "UNKNOWN", auto, false)).toMatch(/not running/);
        expect(followStartBlockedReason(true, "FOLLOWING", auto, false)).toMatch(/Already/);
        expect(followStartBlockedReason(true, "STOPPING", auto, false)).toMatch(/stopping/);
        expect(followStartBlockedReason(true, "IDLE", DRIVE_MODE.ASSISTED, false)).toMatch(/Automatic/);
        expect(followStartBlockedReason(true, "IDLE", null, false)).toMatch(/unknown/);
        expect(followStartBlockedReason(true, "IDLE", auto, true)).toMatch(/mission/);
    });
});
