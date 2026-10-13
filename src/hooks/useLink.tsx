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

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

import { INITIAL_LINK, type LinkState, nextLinkState } from "../lib/link";
import { useRos } from "../ros/RosProvider";

// Round trip browser -> nginx -> foxglove_bridge -> ROS service -> back. /rosapi/get_time is
// cheap and always up alongside the bridge (isaacbot_amr_web_bridges.launch.py starts both).
const PROBE_SERVICE = "/rosapi/get_time";
const PERIOD_MS = 2000;
const PROBE_TIMEOUT_MS = 1500;

const LinkContext = createContext<LinkState>(INITIAL_LINK);

/** The link quality, shared by the Link pill and the map's low-bandwidth mode. */
export const useLink = () => useContext(LinkContext);

export const LinkProvider = ({ children }: { children: ReactNode }) => {
    const { ros, connected, session } = useRos();
    const [link, setLink] = useState<LinkState>(INITIAL_LINK);

    useEffect(() => {
        // Keep slow/paused across a reconnect: a weak link is the usual reason for one.
        setLink((prev) => ({ ...prev, latency: null }));
        if (!ros || !connected) return;
        let cancelled = false;
        let inFlight = false;
        const probe = async () => {
            if (inFlight || !ros.hasService(PROBE_SERVICE)) return;
            inFlight = true;
            const start = performance.now();
            try {
                await ros.callService(PROBE_SERVICE, {}, PROBE_TIMEOUT_MS);
                const latency = Math.round(performance.now() - start);
                if (!cancelled) setLink((prev) => nextLinkState(prev, { ok: true, latency }, Date.now()));
            } catch {
                if (!cancelled) setLink((prev) => nextLinkState(prev, { ok: false }, Date.now()));
            } finally {
                inFlight = false;
            }
        };
        const id = setInterval(probe, PERIOD_MS);
        probe();
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [ros, connected, session]);

    return <LinkContext.Provider value={link}>{children}</LinkContext.Provider>;
};
