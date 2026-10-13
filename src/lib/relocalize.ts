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

// "Find me": ask AMCL to forget its estimate and spread particles over the whole map, then
// run a few filter updates on the current scan so the cloud starts collapsing at once.
// A last resort for a isaacbot moved while off - in corridors or repeated bays AMCL can settle
// on a look-alike spot (see isaacbot_amr_nav_params.yaml), so Set pose stays the first choice.

export const GLOBAL_LOCALIZATION = "reinitialize_global_localization";
export const NOMOTION_UPDATE = "request_nomotion_update";

export interface RelocalizeDeps {
    /** Calls a std_srvs/Empty service under the isaacbot namespace. */
    call: (service: string) => Promise<unknown>;
    sleep: (ms: number) => Promise<void>;
}

export const findMe = async ({ call, sleep }: RelocalizeDeps, updates = 3, gapMs = 300) => {
    await call(GLOBAL_LOCALIZATION);
    for (let i = 0; i < updates; i++) {
        await sleep(gapMs);
        await call(NOMOTION_UPDATE);
    }
};
