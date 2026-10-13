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
import { Ros } from "./index";

export interface RosConnection {
    ros: Ros | null;
    connected: boolean;
    // Incremented on every (re)connection. Each connection is a new bridge session, so
    // subscriptions and publishers must be re-created: list it in effect dependencies.
    session: number;
}

const RETRY_DELAY_MS = 2000;
// foxglove_bridge 3.x (the foxglove-sdk based bridge on Jazzy and later, 3.5 on Lyrical)
// only accepts "foxglove.sdk.v1"; @foxglove/ws-protocol only knows the older
// "foxglove.websocket.v1" name. The wire protocol is compatible for what we use, so offer
// both and let the bridge pick (same as isaacbot_amr_cockpit_ros2_diagnostics).
export const SUBPROTOCOLS = ["foxglove.sdk.v1", "foxglove.websocket.v1"];
const DISCONNECTED: RosConnection = { ros: null, connected: false, session: 0 };

const RosContext = createContext<RosConnection>(DISCONNECTED);

export const useRos = () => useContext(RosContext);

/** The same-origin endpoint nginx (or Vite in dev) proxies to foxglove_bridge. */
export const bridgeUrl = (location: Pick<Location, "protocol" | "host" | "pathname">) => {
    const scheme = location.protocol === "https:" ? "wss:" : "ws:";
    const base = location.pathname.replace(/[^/]*$/, "");
    return `${scheme}//${location.host}${base}ws`;
};

export const RosProvider = ({ children }: { children: ReactNode }) => {
    const [connection, setConnection] = useState<RosConnection>(DISCONNECTED);

    useEffect(() => {
        const url = bridgeUrl(window.location);
        const ros = new Ros();
        let session = 0;
        let retry = true;
        let retryTimeout: ReturnType<typeof setTimeout> | undefined;

        const connect = () => {
            clearTimeout(retryTimeout);
            ros.connect(new WebSocket(url, SUBPROTOCOLS));

            ros.on("connection", () => {
                session += 1;
                setConnection({ ros, connected: true, session });
            });
            ros.on("error", (error) => {
                console.warn("foxglove_bridge connection error:", error);
            });
            ros.on("close", () => {
                setConnection({ ros, connected: false, session });
                clearTimeout(retryTimeout);
                if (retry) retryTimeout = setTimeout(connect, RETRY_DELAY_MS);
            });
        };

        connect();

        return () => {
            retry = false;
            clearTimeout(retryTimeout);
            ros.close();
            setConnection(DISCONNECTED);
        };
    }, []);

    return <RosContext.Provider value={connection}>{children}</RosContext.Provider>;
};
