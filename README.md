<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="icons/isaacbot-lockup-white.svg">
    <img src="icons/isaacbot-lockup-black-bold.svg" alt="IsaacBot" width="240">
  </picture>
</p>

# isaacbot_amr_drive_interface

A browser drive interface for **ardennes**, modelled on the Clearpath Boxer's OTTO App and
the Clearpath IndoorNav web GUI. It covers one isaacbot and indoor (2D map) navigation.

The page is a static React + TypeScript app. It talks ROS 2 through
[foxglove_bridge](https://github.com/foxglove/ros-foxglove-bridge) using the Foxglove
websocket protocol, so the container that serves it runs no ROS. On the isaacbot it ships as the
balena service **`rover-a1-drive-interface`** (see `rover_docker/rover_a1_drive_interface/`
in the ardennes workspace):
- nginx on port **5000**, behind a basic-auth login;
- the same-origin **`/ws`** endpoint proxied to foxglove_bridge on `127.0.0.1:8765`.

```
browser ──http/ws :5000──► nginx (rover-a1-drive-interface) ──ws──► foxglove_bridge :8765 (rover-a1-platform) ──► ROS 2
```

## Features

- **Driving modes.** The isaacbot has three, owned by `isaacbot_amr_drive_mode` (isaacbot_amr_orchestrator) and
  shared by every browser: the UI reads the latched `<ns>/drive_mode` (`isaacbot_amr_msgs/DriveMode`)
  and asks for a change with `<ns>/set_drive_mode`. The selector moves only when the isaacbot says
  so, and a refused request (Automatic without the mission manager) shows the reason.
  - **Manual:** the joystick drives the isaacbot directly, with no obstacle check.
  - **Assisted:** the joystick goes through a lidar collision monitor on the isaacbot, which slows
    the isaacbot down and then stops it in front of obstacles. The zones follow the stick, so you
    can still back away or turn. With no lidar data it blocks all motion.
  - **Automatic:** Nav 2 drives (Go to, places, workflows). Moving the joystick takes over: the
    isaacbot switches to Assisted and cancels the mission. Go to is disabled in the other modes.
  A guard chip shows what the lidar is doing: Path clear, Slowing, Obstacle - stopped, No lidar,
  or No obstacle check (Manual). The RC transmitter and Foxglove bypass the modes.
- **Joystick on / off.** Per browser, starts off and publishes nothing. When on, the page
  publishes `geometry_msgs/TwistStamped` on `<ns>/teleop_web_cmd_vel_stamped` at 10 Hz while the
  stick is deflected; `isaacbot_amr_drive_mode` routes it by mode onto twist_mux's web-teleop input
  (`teleop_driver_interface_cmd_vel_stamped`, priority 8: it beats Nav 2 (5), while the RC link
  (110) and Foxglove (100) override it). Releasing the stick sends a short burst of zeros
  (~300 ms, so one lost message cannot leave the isaacbot moving) and then nothing, as the RC
  teleop does.
- **Stale commands are dropped on the isaacbot.** `isaacbot_amr_command_freshness_node` (isaacbot_amr_twist_mux)
  passes the UI's commands to twist_mux only while they are fresh, so commands held in the
  websocket through a Wi-Fi stall are not replayed. It works from the `header.stamp` this UI
  sets, and tolerates the browser's clock being offset from the isaacbot's.
- **Deadman.** Publishing stops when:
  - the page is hidden or unfocused, or the bridge connection drops (hidden or disconnected
    also turns the joystick off);
  - twist_mux's 0.3 s timeout on this input then stops the isaacbot.
- **Controls.**
  - On-screen joystick, or a gamepad while **L1/LB** is held.
  - A compact **map drive widget** (mode, joystick on/off, joystick, speed) at the lower right of
    the map on the Navigate and Facility tabs. It opens by itself when mapping starts, so a
    facility map can be recorded without the RC transmitter.
  - The joystick keeps publishing whichever tab is open; the loop lives above the tabs.
  - Speed presets 20/50/80/100 % of the configured maximum.
  - Expo curve per axis (`expoLinear` 0.3, `expoAngular` 0.5): small stick moves give much
    less speed (30 % turn stick → 16 %), full stick is still full speed. 0 = linear.
  - Rim-speed limit, as in isaacbot_amr_crsf_teleop. When |v| + |w| · track/2 would exceed
    `maxRimSpeed` (1.7 m/s), v and w are scaled together, so the isaacbot drives the commanded arc
    more slowly instead of the outer wheel being clipped into a tighter turn.
  - Software e-stop set/reset and safety-latch reset (`<ns>/hardware_interface/sw_*`).
- **Map (Navigate).** Shows:
  - the occupancy map;
  - the lidar scan, the Nav 2 plan and an optional global costmap;
  - the isaacbot and its places.
  Tools:
  - **Set pose** (AMCL `initialpose`);
  - **Go to**, which calls isaacbot_amr_mission_manager's `set_mission` (Automatic mode only);
  - **Add place**;
  - **Stop**.
  Rotation:
  - ↺ / ↻ turn the map a quarter turn; **Shift + wheel** or a **two-finger twist** turns it
    freely, snapping onto a quarter turn when within 5°;
  - the arrow button is **Map up**: it points along the map's +Y axis and resets the rotation.
    That is north only when the map frame is GPS-aligned; indoors (SLAM/AMCL) it is the
    heading the isaacbot had when the map was started;
  - **Heading up** (next to Follow) turns the map so the isaacbot always points up, and follows
    it: joystick forward is then screen up;
  - the angle is remembered per map, in this browser;
  - poses drawn on a turned map (Set pose, Go to, Add place) keep the heading drawn on screen.
- **Places.** Named poses per map, stored on the isaacbot by isaacbot_amr_indoor_nav_manager:
  - **Go** to one;
  - rename or delete;
  - **Save here**;
  - an **A → B → C workflow**, run as one mission.
- **Facility.** **Start mapping** (slam_toolbox), **Save map**, and **Load** a saved map
  (map_server + AMCL, switched at runtime) or delete one.
  Needs `ISAACBOT_AMR_ORCH_LOCALIZATION_SOURCE=indoor` on the orchestrator.
- **Localization quality.** A Boxer-style Good / Fair / Poor indicator in the top bar. It combines:
  - the share of lidar points that land on a wall of the saved map (scan-to-map match);
  - AMCL's reported uncertainty (`amcl_pose` covariance).
  On the map, matched scan points are green and unmatched ones red, so you can see where the map
  and the world disagree.
  Thresholds: Good ≥ 70 % matched and σ ≤ 0.35 m; Poor < 40 % or σ > 1 m.
- **Top bar.** Shows:
  - safety (e-stop, latch, contactor, `motion_lock`);
  - worst `diagnostics_agg` level - click it for the diagnostics popup;
  - aux IO: how many aux outputs are on - click it for the Aux IO popup;
  - battery and charging;
  - link latency (round trip through `/rosapi/get_time`);
  - the localization mode.

- **Diagnostics popup.** Clicking the top bar's diagnostics level opens the same view as
  Cockpit's **ROS 2 Diagnostics** page, over the same `<ns>/diagnostics_agg` topic:
  - a timeline of the last 30 snapshots (~30 s at the aggregator's 1 Hz) - click one to
    freeze the view on it, **Pause** / **Resume** to stop and restart the strip;
  - **Errors** and **Warnings** cards listing the failing tasks by name, path and message
    (a task that stopped reporting - STALE - counts as an error, as it does in Cockpit);
  - **All Diagnostics**: the whole aggregated tree, expandable, with a detail pane showing
    a task's path, hardware ID, level and key/value pairs.
  The history keeps filling while the popup is closed, so the timeline is already full when
  it opens. Cockpit's *Capture Diagnostics* has no equivalent here - it runs commands on the
  robot through Cockpit's privileged API, so log capture stays on the Cockpit page.

- **Aux IO popup.** Clicking the top bar's **Aux IO** chip opens a popup for the safety PLC's
  general-purpose IO (not part of the safety chain):
  - six **outputs** (PLC DIO00..05), each with an ON/OFF switch that calls
    `<ns>/hardware_interface/aux_output_<i>/set` (`std_srvs/SetBool`). No confirmation.
  - The switch shows what the PLC reads back, not just the last click. A switch that the PLC
    still disagrees with 1 s after the isaacbot accepted it is flagged, and a rejected or
    timed-out call shows its reason on that row.
  - six **inputs** (DIO06..11), shown ON/OFF.
  - Both come from `<ns>/hardware_interface/aux_io_state` (`isaacbot_amr_msgs/AuxIoState`).
    Switches are disabled while that topic is stale (3 s) or reports the PLC link down.
  - Names come from `auxOutputNames` / `auxInputNames` in `config.json`
    (`ISAACBOT_AMR_UI_AUX_OUTPUT_NAMES` / `ISAACBOT_AMR_UI_AUX_INPUT_NAMES`, comma-separated).
  Needs the isaacbot_amr_hardware_interface aux IO support. There is none in simulation.

Tabs can be deep-linked: `#drive`, `#navigate`, `#facility`.

## Development

```bash
npm ci
npm test            # vitest: geometry, TF, teleop, occupancy grid, status
npm run build       # type-check + production bundle in dist/
ISAACBOT_AMR_BRIDGE=ws://<isaacbot-ip>:8765 npm run dev   # http://localhost:5000, Vite proxies /ws
```

`public/config.json` holds the development defaults. In the container, `start.sh` renders it
from `ISAACBOT_AMR_SYSTEM_NAMESPACE` and `ISAACBOT_AMR_UI_*`.

## Layout

```
src/
├── ros/          # vendored foxglove_bridge client (LGPL-2.1, see src/ros/NOTICE.md)
├── lib/          # pure logic, unit tested: geometry, tf, teleop, occupancy grid, status
├── hooks/        # useTopic, useServiceCall, useLink, usePageActive
└── components/   # TopBar, DrivePanel, Joystick, EStopPanel, …
test/             # vitest
```

## Branding

The official IsaacBot brand files live in `icons/` (copied from the company branding). The white mark
(`public/isaacbot-mark-white.svg`) is used in the top bar; the favicon is the black or white mark,
following the browser's colour scheme. The accent colour `#fca800` was sampled from the former
Mechatronics Academy logo.
Icons come from [lucide-react](https://lucide.dev) (ISC).

## License

Apache-2.0 (`LICENSE`). The vendored client in `src/ros/` is LGPL-2.1-or-later
(`src/ros/COPYING.LESSER`, `src/ros/NOTICE.md`), and so is `src/lib/diagnostics.ts`, whose
tree building, leaf filtering and level ladder are ported from
[isaacbot_amr_cockpit_ros2_diagnostics](https://github.com/isaacbotsrl/isaacbot_amr_cockpit_ros2_diagnostics)
(itself a fork of clearpathrobotics/cockpit-ros2-diagnostics). Each file names its upstream
in its header. The production build strips comments, so `vite build` also writes these
license texts to `dist/licenses/`, which nginx serves next to the page.
