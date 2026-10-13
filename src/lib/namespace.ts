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

// Namespace handling. The isaacbot runs every node under $ISAACBOT_AMR_SYSTEM_NAMESPACE (e.g. "isaacbot"),
// so both topic names and TF frame ids carry it as a prefix.

// Same rules as isaacbot_amr_cockpit_ros2_diagnostics' sanitizeNamespace: keep [A-Za-z0-9_/],
// no leading digits per segment, single leading slash, no trailing slash.
export const sanitizeNamespace = (namespace: string): string => {
    const cleaned = namespace
            .replace(/[^a-zA-Z0-9_/]/g, "")
            .replace(/_+/g, "_")
            .replace(/\/+/g, "/")
            .replace(/^\d+/, "")
            .replace(/\/\d+/g, "/")
            .replace(/\/+/g, "/")
            .replace(/^\/|\/$/g, "");
    return cleaned ? `/${cleaned}` : "";
};

/** Absolute topic/service name under the namespace: ("/isaacbot", "scan") -> "/isaacbot/scan". */
export const nsName = (namespace: string, name: string): string => {
    const relative = name.replace(/^\/+/, "");
    return `${namespace}/${relative}`;
};

/** TF frame id under the namespace: ("/isaacbot", "base_link") -> "isaacbot/base_link". */
export const nsFrame = (namespace: string, frame: string): string => {
    const prefix = namespace.replace(/^\/+/, "");
    return prefix ? `${prefix}/${frame}` : frame;
};

/** Frame ids compare without a leading slash (tf2 strips it too). */
export const normalizeFrame = (frame: string): string => frame.replace(/^\/+/, "");
