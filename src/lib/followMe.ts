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

// Follow-me (isaacbot_amr_follow_me): what the Follow me card shows and allows. The isaacbot side is the
// follow_me node: follow_me/start, follow_me/stop (std_srvs/Trigger) and the latched
// follow_me/status, "PHASE: detail".

import { DRIVE_MODE, isDriveMode } from "./driveMode";
import type { Level } from "./status";

export type FollowPhase =
    "IDLE" | "STARTING" | "FOLLOWING" | "SEARCHING" | "WAITING" | "STOPPING" | "UNKNOWN";

const PHASES: FollowPhase[] = ["IDLE", "STARTING", "FOLLOWING", "SEARCHING", "WAITING", "STOPPING"];

export interface FollowStatus {
    phase: FollowPhase;
    detail: string;
}

export const FOLLOW_PHASE_LABEL: Record<FollowPhase, string> = {
    IDLE: "Not following",
    STARTING: "Starting",
    FOLLOWING: "Following",
    SEARCHING: "Searching",
    WAITING: "Waiting for the person",
    STOPPING: "Stopping",
    UNKNOWN: "No follow-me",
};

/** "FOLLOWING: following" -> { phase: "FOLLOWING", detail: "following" }. */
export const parseFollowStatus = (text: string | null | undefined): FollowStatus => {
    if (!text) return { phase: "UNKNOWN", detail: "" };
    const colon = text.indexOf(":");
    const head = (colon < 0 ? text : text.slice(0, colon)).trim();
    const detail = colon < 0 ? "" : text.slice(colon + 1).trim();
    const phase = PHASES.find((p) => p === head) ?? "UNKNOWN";
    return { phase, detail: phase === "UNKNOWN" ? text : detail };
};

export const followLevel = (phase: FollowPhase): Level => {
    switch (phase) {
        case "FOLLOWING": return "ok";
        case "STARTING":
        case "SEARCHING":
        case "WAITING":
        case "STOPPING": return "warn";
        default: return "unknown";
    }
};

/**
 * Follow-me is on: a goal is out (or about to be), or the isaacbot stands waiting for a lost person
 * and follows again once they are back. Stop makes sense, Start does not.
 */
export const isFollowing = (phase: FollowPhase): boolean =>
    phase === "STARTING" || phase === "FOLLOWING" || phase === "SEARCHING" || phase === "WAITING";

/**
 * Why Start would be refused, as far as the page can tell (the isaacbot checks again and says
 * why it refuses, e.g. no person in front). Null when Start may be tried.
 */
export const followStartBlockedReason = (
    available: boolean,
    phase: FollowPhase,
    driveMode: number | null | undefined,
    missionActive: boolean,
): string | null => {
    if (!available) return "Follow-me is not running on the isaacbot (ISAACBOT_AMR_SYSTEM_FOLLOW_ME_ENABLE)";
    if (isFollowing(phase)) return "Already following";
    if (phase === "STOPPING") return "Still stopping";
    if (driveMode === null || driveMode === undefined || !isDriveMode(driveMode))
        return "Driving mode unknown - is isaacbot_amr_drive_mode running on the orchestrator?";
    if (driveMode !== DRIVE_MODE.AUTOMATIC) return "Switch to Automatic to follow";
    if (missionActive) return "Stop the mission first";
    return null;
};
