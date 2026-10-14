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

import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";

import { levelName, levelToLevel } from "../../lib/diagnostics";

/**
 * The one place a DiagnosticStatus level becomes an icon. Upstream bakes a JSX icon into
 * every tree entry; keeping it here leaves `lib/diagnostics.ts` pure (and node-testable).
 */
export const DiagnosticsLevelIcon = ({ level, size = 15 }: { level: number; size?: number }) => {
    if (level < 0) return null;
    const Icon = level === 3 ? HelpCircle : level === 2 ? AlertCircle : level === 1 ? AlertTriangle : CheckCircle2;
    return (
        <span className={`diag-icon lvl-${levelToLevel(level)}`} title={levelName(level)}>
            <Icon size={size} />
        </span>
    );
};
