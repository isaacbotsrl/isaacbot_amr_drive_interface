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

import { useApp } from "../AppContext";
import { type AuxIoStateMsg, type AuxIoSummary, summarizeAuxIo } from "../lib/auxIo";
import { nsName } from "../lib/namespace";
import { useRos } from "../ros/RosProvider";
import { useNow, useTopic } from "./useTopic";

/** Latest aux_io_state, summarized for the top-bar chip and the Aux IO popup. */
export const useAuxIo = (): AuxIoSummary => {
    const { config } = useApp();
    const { connected } = useRos();
    const now = useNow(500);
    const aux = useTopic<AuxIoStateMsg>(
        nsName(config.namespace, "hardware_interface/aux_io_state"), "isaacbot_amr_msgs/msg/AuxIoState", 100);

    return summarizeAuxIo(aux.message, aux.receivedAt, now, connected);
};
