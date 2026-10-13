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

import { useEffect, useRef } from "react";

import { Topic } from "../ros";
import { useRos } from "../ros/RosProvider";

/**
 * Subscribe without re-rendering: every message goes to `onMessage` (typically writing a
 * ref and marking a canvas dirty). For high-rate topics such as /tf and scan.
 */
export const useSubscriptionRef = <T,>(
    name: string | null,
    messageType: string,
    onMessage: (message: T) => void,
) => {
    const { ros, connected, session } = useRos();
    const handler = useRef(onMessage);
    handler.current = onMessage;

    useEffect(() => {
        if (!ros || !connected || !name) return;
        const topic = new Topic<T>({ ros, name, messageType });
        const callback = (message: T) => handler.current(message);
        topic.subscribe(callback);
        return () => topic.unsubscribe(callback);
    }, [ros, connected, session, name, messageType]);
};
