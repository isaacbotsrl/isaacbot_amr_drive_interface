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

/*
 * First written for isaacbotsrl/isaacbot_amr_cockpit_ros2_diagnostics
 * (`src/diagnostics/valueLabels.ts`, LGPL-2.1-or-later there); relicensed here under
 * Apache-2.0 by its sole author.
 *
 * Plain-language meaning for boolean diagnostic values whose True/False is easy to misread.
 *
 * The safety pins arrive as raw True/False, and the polarity is not obvious from the name
 * alone: "HW E-Stop user button: False" reads as "the E-Stop is off" to some people and "the
 * button is not working" to others. This spells out what each level means physically, next to
 * the raw value rather than instead of it, so the value stays copyable into a bug report.
 *
 * Keys are the exact strings isaacbot_amr_twist_mux's "Motion lock" diagnostic publishes (see
 * isaacbot_amr_twist_mux/src/infrastructure/motion_lock_node.cpp, diagnoseMotionLock()). A key that
 * is renamed there simply loses its label here - it never gets a wrong one.
 */

interface BooleanMeaning {
    whenTrue: string;
    whenFalse: string;
}

const BOOLEAN_MEANINGS: Readonly<Record<string, BooleanMeaning>> = {
    // Physical mushroom button on the isaacbot, read from the PLC's discrete input.
    "HW E-Stop user button": { whenTrue: "PRESSED", whenFalse: "RELEASED" },
    // The software E-Stop request (RC switch, isaacbot_amr_safety, service call).
    "SW E-Stop user button": { whenTrue: "PRESSED", whenFalse: "RELEASED" },
    // The PLC's E-Stop latch, set by any of its trip sources and held until an explicit reset.
    "SW E-Stop latch status": { whenTrue: "ON", whenFalse: "OFF" },
};

/**
 * The physical meaning of a diagnostic value, or null when the key has none or the value is
 * not a recognisable boolean (so nothing is ever labelled on a guess).
 */
export const booleanMeaning = (key: string, value: string): string | null => {
    const meaning = BOOLEAN_MEANINGS[key];
    if (!meaning) return null;

    switch (value.trim().toLowerCase()) {
    case "true":
        return meaning.whenTrue;
    case "false":
        return meaning.whenFalse;
    default:
        return null;
    }
};
