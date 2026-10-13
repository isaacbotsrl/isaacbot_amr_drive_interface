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

import { Footprints, Play, Square } from "lucide-react";

import { useApp } from "../AppContext";
import { useDriveMode } from "../hooks/useDriveMode";
import { useTopic } from "../hooks/useTopic";
import {
    FOLLOW_PHASE_LABEL,
    followLevel,
    followStartBlockedReason,
    isFollowing,
    parseFollowStatus,
} from "../lib/followMe";
import { nsName } from "../lib/namespace";
import type { MissionState } from "../lib/rosTypes";
import { useRos } from "../ros/RosProvider";
import { isActive } from "./NavPanel";
import { StatusChip } from "./StatusChip";
import { TriggerButton } from "./TriggerButton";

/**
 * Follow me (isaacbot_amr_follow_me): start and stop following, and what the isaacbot is doing. The isaacbot
 * follows through Nav 2's Following server, only in Automatic and never during a mission; it
 * explains a refused start itself (the alert shows its reason).
 */
export const FollowMePanel = ({ mission }: { mission: MissionState | null }) => {
    const { config } = useApp();
    const { ros } = useRos();
    const driveMode = useDriveMode();
    const statusName = nsName(config.namespace, "follow_me/status");
    const startName = nsName(config.namespace, "follow_me/start");
    const stopName = nsName(config.namespace, "follow_me/stop");
    const statusMsg = useTopic<{ data: string }>(statusName, "std_msgs/msg/String");
    const status = parseFollowStatus(statusMsg.message?.data);
    const available = status.phase !== "UNKNOWN" || (ros?.hasService(startName) ?? false);
    const blocked = followStartBlockedReason(available, status.phase, driveMode.mode, isActive(mission));
    const following = isFollowing(status.phase);

    return (
        <section className="card">
            <div className="card-head"><h3 className="card-title"><Footprints size={15} />Follow me</h3></div>
            <div className="nav-status">
                <StatusChip
                    level={followLevel(status.phase)}
                    label={FOLLOW_PHASE_LABEL[status.phase]}
                    title={status.detail || undefined}
                />
                {status.detail && <span className="muted">{status.detail}</span>}
            </div>
            {following ? (
                <TriggerButton
                    service={stopName}
                    label="Stop following"
                    icon={<Square size={16} fill="currentColor" />}
                    className="btn btn-danger btn-wide"
                />
            ) : (
                <TriggerButton
                    service={startName}
                    label="Follow me"
                    icon={<Play size={16} />}
                    className="btn btn-wide"
                    disabled={blocked !== null}
                    title={blocked ?? undefined}
                />
            )}
            <p className="hint">
                {blocked && !following
                    ? `${blocked}.`
                    : following
                        ? "The isaacbot keeps about 1.2 m behind you. Moving the joystick takes over and stops following."
                        : "Stand about 1.5 m in front of the isaacbot, facing away, then press Follow me."}
            </p>
        </section>
    );
};
