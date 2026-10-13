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

import { Check, Flag, MapPin, Star, X } from "lucide-react";
import { type ReactNode, useState } from "react";

import type { Pose2D } from "../lib/geometry";
import type { MapTool } from "./MapView";

const ICONS: Record<MapTool, ReactNode> = {
    pan: null,
    setPose: <MapPin size={16} />,
    goTo: <Flag size={16} />,
    place: <Star size={16} />,
    measure: null,
};

const TITLES: Record<MapTool, string> = {
    pan: "",
    setPose: "Set the isaacbot's pose here?",
    goTo: "Send the isaacbot here?",
    place: "Save this place",
    measure: "",
};

export const PendingBar = ({ tool, pose, busy, error, onConfirm, onCancel }: {
    tool: MapTool;
    pose: Pose2D;
    busy: boolean;
    error: string | null;
    onConfirm: (name: string) => void;
    onCancel: () => void;
}) => {
    const [name, setName] = useState("");
    const needsName = tool === "place";
    return (
        <div className="pending-bar">
            <div>
                <div className="pending-title">{ICONS[tool]}{TITLES[tool]}</div>
                <div className="mono muted">
                    x {pose.x.toFixed(2)} · y {pose.y.toFixed(2)} · θ {(pose.theta * 180 / Math.PI).toFixed(0)}°
                </div>
                {error && <div className="error-text">{error}</div>}
            </div>
            {needsName && (
                <input
                    autoFocus
                    className="text-input"
                    placeholder="Place name"
                    value={name}
                    maxLength={64}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onConfirm(name.trim()) }}
                />
            )}
            <div className="pending-actions">
                <button
                    className="btn btn-primary"
                    disabled={busy || (needsName && !name.trim())}
                    onClick={() => onConfirm(name.trim())}
                >
                    <Check size={15} />{tool === "goTo" ? "Go" : tool === "setPose" ? "Set pose" : "Save"}
                </button>
                <button className="btn" onClick={onCancel}><X size={15} />Cancel</button>
            </div>
        </div>
    );
};
