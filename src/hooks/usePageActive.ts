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

import { useEffect, useState } from "react";

/** True while the tab is visible and the window has focus - the deadman's "hand on the UI". */
export const usePageActive = () => {
    const [visible, setVisible] = useState(() => document.visibilityState === "visible");
    const [focused, setFocused] = useState(() => document.hasFocus());

    useEffect(() => {
        const onVisibility = () => setVisible(document.visibilityState === "visible");
        const onFocus = () => setFocused(true);
        const onBlur = () => setFocused(false);
        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("focus", onFocus);
        window.addEventListener("blur", onBlur);
        return () => {
            document.removeEventListener("visibilitychange", onVisibility);
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("blur", onBlur);
        };
    }, []);

    return { visible, focused };
};
