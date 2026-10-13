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

import { type DiagnosticsSnapshot, levelName, timelineSlots } from "../../lib/diagnostics";

const time = (ms: number | undefined) => (ms === undefined ? "N/A" : new Date(ms).toLocaleTimeString());

/**
 * The last 30 snapshots as a strip of coloured bars, newest on the right. Clicking one pauses
 * and shows it; while running the strip follows the newest.
 *
 * The Cockpit page uses PatternFly's circle stepper - 30 circles do not fit a dialog, so the
 * same data is drawn as bars. `negIndex` counts back from the newest (-1 = latest) so the
 * selection survives older entries falling off the front.
 */
export const DiagnosticsTimeline = ({ history, negIndex, paused, onSelect }: {
    history: DiagnosticsSnapshot[];
    negIndex: number;
    paused: boolean;
    onSelect: (index: number) => void;
}) => {
    const slots = timelineSlots(history, negIndex);
    const selected = history[history.length + negIndex];

    return (
        <section className="diag-history">
            <div className="diag-timeline-row">
                <span className="diag-timeline-label">Timeline</span>
                <div className="diag-timeline">
                    {slots.map((slot, i) => (slot.kind === "blank"
                        ? <span key={`blank-${i}`} className="diag-step diag-step-blank" />
                        : (
                            <button
                                key={`snap-${slot.index}`}
                                type="button"
                                className={`diag-step diag-step-${slot.level} ${slot.selected ? "diag-step-selected" : ""}`}
                                onClick={() => onSelect(slot.index)}
                                aria-label={`Snapshot ${slot.index + 1} of ${history.length}, ${levelName(history[slot.index].level)}, ${time(history[slot.index].timestamp)}`}
                                aria-pressed={slot.selected}
                                title={time(history[slot.index].timestamp)}
                            />
                        )))}
                </div>
            </div>
            <div className="diag-times">
                <span>Oldest: {time(history[0]?.timestamp)}</span>
                {paused && <span className="diag-time-selected">Selected: {time(selected?.timestamp)}</span>}
                <span>Latest: {time(history[history.length - 1]?.timestamp)}</span>
            </div>
        </section>
    );
};
