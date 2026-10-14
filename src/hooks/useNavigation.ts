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

import { useCallback } from "react";

import { useApp } from "../AppContext";
import { quaternionFromYaw, type Pose2D } from "../lib/geometry";
import { nsName } from "../lib/namespace";
import { initialPoseCovariance, type MissionState, stampNow } from "../lib/rosTypes";
import { Topic } from "../ros";
import { useRos } from "../ros/RosProvider";
import { useTopic } from "./useTopic";

interface SetMissionResponse { success: boolean; message: string }

export interface NamedPose extends Pose2D { name?: string }

const poseStamped = (frame: string, p: Pose2D) => ({
    header: { stamp: stampNow(), frame_id: frame },
    pose: { position: { x: p.x, y: p.y, z: 0 }, orientation: quaternionFromYaw(p.theta) },
});

/**
 * Autonomy through isaacbot_amr_mission_manager (set_mission / run_mission / mission_state) and
 * re-localization through AMCL's initialpose. Nav 2's actions are never called from the
 * browser: the manager owns goal dispatch, the motion-lock hold and the battery abort.
 */
export const useNavigation = () => {
    const { config } = useApp();
    const { ros, connected } = useRos();
    const ns = config.namespace;
    const mission = useTopic<MissionState>(nsName(ns, "mission_state"), "isaacbot_amr_msgs/msg/MissionState");

    const runMission = useCallback(async (frame: string, waypoints: Pose2D[], missionId = "") => {
        if (!ros || !connected) throw new Error("Not connected");
        const res = await ros.callService<unknown, SetMissionResponse>(nsName(ns, "set_mission"), {
            mission_id: missionId,
            waypoints: waypoints.map((w) => poseStamped(frame, w)),
        }, 5000);
        if (!res.success) throw new Error(res.message);
        return res.message;
    }, [ros, connected, ns]);

    const stop = useCallback(async () => {
        if (!ros || !connected) throw new Error("Not connected");
        const res = await ros.callService<{ data: boolean }, SetMissionResponse>(nsName(ns, "run_mission"), { data: false }, 5000);
        if (!res.success) throw new Error(res.message);
    }, [ros, connected, ns]);

    const setInitialPose = useCallback((frame: string, pose: Pose2D) => {
        if (!ros || !connected) throw new Error("Not connected");
        const topic = new Topic<unknown>({ ros, name: nsName(ns, "initialpose"), messageType: "geometry_msgs/msg/PoseWithCovarianceStamped" });
        const p = poseStamped(frame, pose);
        topic.publish({ header: p.header, pose: { pose: p.pose, covariance: initialPoseCovariance() } });
        // Leave the publisher advertised briefly so the message is delivered before teardown.
        setTimeout(() => topic.unadvertise(), 2000);
    }, [ros, connected, ns]);

    return { mission: mission.message, missionReceivedAt: mission.receivedAt, runMission, stop, setInitialPose };
};
