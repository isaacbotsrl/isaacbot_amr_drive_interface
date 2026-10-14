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

import { createContext, useContext } from "react";

import type { AppConfig } from "./config";

export interface AppState {
    config: AppConfig;
    /**
     * This browser's joystick is on (the old Neutral/Manual switch). Local on purpose: the
     * isaacbot's driving mode (useDriveMode) is shared by every browser, while arming is about the
     * one operator in front of this page, and drops back to off when the page is left.
     */
    armed: boolean;
    setArmed: (armed: boolean) => void;
}

export const AppContext = createContext<AppState | null>(null);

export const useApp = (): AppState => {
    const state = useContext(AppContext);
    if (!state) throw new Error("useApp outside AppContext");
    return state;
};
