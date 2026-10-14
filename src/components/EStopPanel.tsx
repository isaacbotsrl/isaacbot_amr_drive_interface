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

import { OctagonX, RotateCcw, ShieldCheck, Unlock } from "lucide-react";

import { useApp } from "../AppContext";
import { nsName } from "../lib/namespace";
import { TriggerButton } from "./TriggerButton";

/** Confirm prompts, shared with the map drive widget's reset row. */
export const RESET_E_STOP_CONFIRM = "Release the software e-stop? Make sure the area around the isaacbot is clear.";
export const RESET_LATCH_CONFIRM = "Reset the safety latch? The motor contactor will re-engage.";

export const EStopPanel = () => {
    const { config } = useApp();
    const hw = (name: string) => nsName(config.namespace, `hardware_interface/${name}`);
    return (
        <section className="card">
            <div className="card-head">
                <h3 className="card-title"><ShieldCheck size={15} />Safety</h3>
            </div>
            <div className="estop-grid">
                <TriggerButton service={hw("sw_user_e_stop_set")} label="E-STOP" icon={<OctagonX size={20} />}
                    className="btn btn-estop" wrapClassName="btn-estop-wrap" />
                <TriggerButton
                    service={hw("sw_user_e_stop_reset")}
                    label="Reset e-stop"
                    icon={<RotateCcw size={15} />}
                    className="btn"
                    confirmText={RESET_E_STOP_CONFIRM}
                />
                <TriggerButton
                    service={hw("sw_e_stop_latch_reset")}
                    label="Reset latch"
                    icon={<Unlock size={15} />}
                    className="btn"
                    confirmText={RESET_LATCH_CONFIRM}
                />
            </div>
            <p className="hint">The software e-stop cuts the motor contactor. The hardware button always wins. After a restart the latch is set - reset it before driving.</p>
        </section>
    );
};
