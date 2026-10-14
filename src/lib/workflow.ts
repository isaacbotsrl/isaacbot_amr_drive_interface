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

// A-B-C workflows (IndoorNav "workflows"): an ordered list of place ids run as one mission.
import type { PlaceMsg } from "./rosTypes";

/** Resolve ids to places, dropping ids whose place was deleted. */
export const resolveWorkflow = (ids: string[], places: PlaceMsg[]): PlaceMsg[] => {
    const byId = new Map(places.map((p) => [p.id, p]));
    return ids.map((id) => byId.get(id)).filter((p): p is PlaceMsg => p !== undefined);
};

export const moveStep = (ids: string[], index: number, delta: number): string[] => {
    const target = index + delta;
    if (index < 0 || index >= ids.length || target < 0 || target >= ids.length) return ids;
    const next = [...ids];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
};

export const removeStep = (ids: string[], index: number): string[] => ids.filter((_, i) => i !== index);

/** Mission id shown in mission_state: place names joined, trimmed to something readable. */
export const workflowLabel = (steps: PlaceMsg[]): string => {
    const label = steps.map((p) => p.name).join(" → ");
    return label.length > 60 ? `${label.slice(0, 57)}…` : label;
};

export const MAP_NAME = /^[A-Za-z0-9_-]{1,64}$/;
