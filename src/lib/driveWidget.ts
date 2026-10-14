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

// Visibility of the map drive widget. Kept free of React so the rules can be unit tested.

export type WidgetState = "hidden" | "collapsed" | "expanded";

/** The Drive tab has the full joystick, so the map widget is only on the other tabs. */
export const driveWidgetState = (tab: string, collapsed: boolean): WidgetState =>
    tab === "drive" ? "hidden" : collapsed ? "collapsed" : "expanded";

/**
 * Starting to map opens the widget: covering the area means driving, and without the RC
 * transmitter the map joystick is the only way to do it. Otherwise the viewer's choice stands.
 */
export const collapsedAfterModeChange = (collapsed: boolean, wasMapping: boolean, mapping: boolean): boolean =>
    mapping && !wasMapping ? false : collapsed;
