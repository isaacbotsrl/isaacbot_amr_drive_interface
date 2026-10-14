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

import type { StickInput } from "./teleop";

// Standard-mapping gamepads (PS4/PS5/Xbox in Chrome and Firefox): left stick on axes 0/1,
// LB/L1 = button 4. The shoulder button is a deadman: the stick only counts while it is held.
export const DEADMAN_BUTTON = 4;

export interface PadSnapshot {
    axes: readonly number[];
    buttons: readonly { pressed: boolean }[];
}

/** Stick input from a pad, or null when the deadman is released (the pad is not driving). */
export const padToStick = (pad: PadSnapshot | null | undefined): StickInput | null => {
    if (!pad || !pad.buttons[DEADMAN_BUTTON]?.pressed) return null;
    return { x: pad.axes[0] ?? 0, y: -(pad.axes[1] ?? 0) };
};

export const firstPad = (): PadSnapshot | null => {
    if (typeof navigator === "undefined" || !navigator.getGamepads) return null;
    for (const pad of navigator.getGamepads()) {
        if (pad && pad.connected) return pad;
    }
    return null;
};
