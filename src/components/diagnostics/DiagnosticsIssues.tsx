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

import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

import { type DiagnosticsEntry, leafIssues } from "../../lib/diagnostics";
import { DiagnosticsLevelIcon } from "./DiagnosticsLevelIcon";

/**
 * The Errors / Warnings card: the failing leaf tasks, name over full path, with the message.
 *
 * "error" takes level >= 2, so a STALE task appears here rather than in a card of its own -
 * the Cockpit page groups them the same way, and a task that stopped reporting is a fault.
 */
export const DiagnosticsIssues = ({ tree, variant, selectedRawName, onSelect }: {
    tree: DiagnosticsEntry[];
    variant: "error" | "warning";
    selectedRawName: string | null;
    onSelect: (rawName: string) => void;
}) => {
    const issues = leafIssues(tree, variant);
    const isError = variant === "error";

    return (
        <section className={`card diag-card diag-card-${isError ? "error" : "warn"}`}>
            <div className="card-head">
                <h3 className="card-title">
                    {isError ? <AlertCircle size={15} /> : <AlertTriangle size={15} />}
                    {isError ? "Errors" : "Warnings"}
                    {issues.length > 0 && <span className="diag-count">{issues.length}</span>}
                </h3>
            </div>

            {issues.length === 0
                ? (
                    <p className="diag-empty">
                        <CheckCircle2 size={18} />
                        {isError ? "No Errors" : "No Warnings"}
                    </p>
                )
                : (
                    <table className="diag-table">
                        <thead>
                            <tr><th>Name</th><th>Message</th></tr>
                        </thead>
                        <tbody>
                            {issues.map((entry) => (
                                <tr
                                    key={entry.rawName}
                                    className={`diag-row ${selectedRawName === entry.rawName ? "diag-row-selected" : ""}`}
                                    onClick={() => onSelect(entry.rawName)}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            onSelect(entry.rawName);
                                        }
                                    }}
                                >
                                    <td>
                                        <span className="diag-name">
                                            <DiagnosticsLevelIcon level={entry.level} />
                                            {entry.name || "N/A"}
                                        </span>
                                        <span className="diag-path">{entry.path || "N/A"}</span>
                                    </td>
                                    <td>{entry.message || "N/A"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
        </section>
    );
};
