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

// Which fixed frame the map canvas draws in. Normally the map frame, but without a
// map -> odom transform (no lidar, AMCL/SLAM down, pure odom localization) the isaacbot can
// still be shown on odometry alone - it just drifts.
import { nsFrame } from "./namespace";
import type { TfBuffer } from "./tf";

export type ViewFrameMode = "auto" | "map" | "odom";
export type ViewFrameKind = "map" | "odom";

export interface ViewFrame {
    frame: string;
    kind: ViewFrameKind;
}

export const VIEW_FRAME_MODES: ViewFrameMode[] = ["auto", "map", "odom"];

export const nextViewFrameMode = (mode: ViewFrameMode): ViewFrameMode =>
    VIEW_FRAME_MODES[(VIEW_FRAME_MODES.indexOf(mode) + 1) % VIEW_FRAME_MODES.length];

/**
 * The frame to draw in. `mapFrameId` is the map's header.frame_id when a map has arrived.
 * Auto prefers the map frame whenever the isaacbot can be placed in it, falls back to odom,
 * and stays on map when neither resolves (so the "waiting for a map" state is unchanged).
 */
export const resolveViewFrame = (
    mode: ViewFrameMode,
    tf: TfBuffer,
    namespace: string,
    mapFrameId?: string | null,
): ViewFrame => {
    const map: ViewFrame = { frame: mapFrameId || nsFrame(namespace, "map"), kind: "map" };
    const odom: ViewFrame = { frame: nsFrame(namespace, "odom"), kind: "odom" };
    if (mode === "map") return map;
    if (mode === "odom") return odom;
    const base = nsFrame(namespace, "base_link");
    if (tf.lookup(map.frame, base)) return map;
    if (tf.lookup(odom.frame, base)) return odom;
    return map;
};

export const sameViewFrame = (a: ViewFrame | null, b: ViewFrame | null) =>
    a === b || (!!a && !!b && a.frame === b.frame && a.kind === b.kind);
