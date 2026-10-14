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

import { quaternionFromYaw } from "../src/lib/geometry";
import { TfBuffer, type TransformStamped } from "../src/lib/tf";
import { nextViewFrameMode, resolveViewFrame } from "../src/lib/viewFrame";

const tf = (parent: string, child: string, x = 0, y = 0): TransformStamped => ({
    header: { frame_id: parent },
    child_frame_id: child,
    transform: { translation: { x, y, z: 0 }, rotation: quaternionFromYaw(0) },
});

const odomOnly = () => {
    const buf = new TfBuffer();
    buf.add([tf("isaacbot/odom", "isaacbot/base_footprint", 1, 2), tf("isaacbot/base_footprint", "isaacbot/base_link")]);
    return buf;
};

describe("resolveViewFrame", () => {
    it("auto uses the map frame when the isaacbot is localized", () => {
        const buf = odomOnly();
        buf.add([tf("isaacbot/map", "isaacbot/odom", 5, 0)]);
        expect(resolveViewFrame("auto", buf, "/isaacbot")).toEqual({ frame: "isaacbot/map", kind: "map" });
    });

    it("auto falls back to odom when there is no map -> odom", () => {
        expect(resolveViewFrame("auto", odomOnly(), "/isaacbot")).toEqual({ frame: "isaacbot/odom", kind: "odom" });
    });

    it("auto stays on the map frame when nothing resolves", () => {
        expect(resolveViewFrame("auto", new TfBuffer(), "/isaacbot")).toEqual({ frame: "isaacbot/map", kind: "map" });
    });

    it("uses the map's own frame id when one arrived", () => {
        const buf = odomOnly();
        buf.add([tf("isaacbot/slam_map", "isaacbot/odom")]);
        expect(resolveViewFrame("auto", buf, "/isaacbot", "isaacbot/slam_map").frame).toBe("isaacbot/slam_map");
    });

    it("honours the forced modes", () => {
        const buf = odomOnly();
        buf.add([tf("isaacbot/map", "isaacbot/odom")]);
        expect(resolveViewFrame("odom", buf, "/isaacbot").kind).toBe("odom");
        expect(resolveViewFrame("map", odomOnly(), "/isaacbot").kind).toBe("map");
    });

    it("works without a namespace", () => {
        const buf = new TfBuffer();
        buf.add([tf("odom", "base_link")]);
        expect(resolveViewFrame("auto", buf, "")).toEqual({ frame: "odom", kind: "odom" });
    });

    it("cycles auto -> map -> odom -> auto", () => {
        expect(nextViewFrameMode("auto")).toBe("map");
        expect(nextViewFrameMode("map")).toBe("odom");
        expect(nextViewFrameMode("odom")).toBe("auto");
    });
});
