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

import { useCallback, useState } from "react";

import { useRos } from "../ros/RosProvider";

export interface CallState {
    busy: boolean;
    error: string | null;
}

/** Wraps Ros.callService with busy/error state for buttons. */
export const useServiceCall = <Req, Res>(name: string, timeoutMs = 5000) => {
    const { ros, connected } = useRos();
    const [state, setState] = useState<CallState>({ busy: false, error: null });

    const call = useCallback(async (request: Req): Promise<Res | null> => {
        if (!ros || !connected) {
            setState({ busy: false, error: "Not connected" });
            return null;
        }
        setState({ busy: true, error: null });
        try {
            const response = await ros.callService<Req, Res>(name, request, timeoutMs);
            setState({ busy: false, error: null });
            return response;
        } catch (error) {
            setState({ busy: false, error: error instanceof Error ? error.message : String(error) });
            return null;
        }
    }, [ros, connected, name, timeoutMs]);

    return { call, ...state };
};
