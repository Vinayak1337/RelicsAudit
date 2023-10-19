# Relics Audit Discord Bot

Relics Audit is a Discord bot developed to manage and monitor the [Relics](https://twitter.com/@relics_global) Organisation's activities. It's built with Node.js and JavaScript, leveraging MongoDB for data storage and CRUD operations through the Mongoose library. The codebase adheres to the DRY (Don't Repeat Yourself) principle.

**Note**: This project is deprecated. And due to changes in the API response structure of Brawl Stars & Discord, this project is somewhat functional in its current state. Feel free to fork it anyways.

## Features

### Real-time Club Monitoring
- **Brawl Stars API Integration**: The bot fetches data from the Brawl Stars API every second to monitor changes in Relics clubs.
  - Detects new member arrivals and departures.
  - Tracks role and name modifications.
  - Monitors blacklisted members. If a blacklisted member joins any Relics club, the bot sends an alert on Discord and continues to ping every hour until the member is removed.
  - Updates club statistics and leaderboards on Discord in real-time when any changes occur in a Relics club.

<details>
<summary>Club Monitoring Screenshots</summary>
<p align="center">
  <img src="https://github.com/Vinayak1337/RelicsAudit/assets/34209962/00703433-c627-48f8-aa34-2749a0fa2765" alt="Club Stats" width="45%">
  <img src="https://github.com/Vinayak1337/RelicsAudit/assets/34209962/02cce930-8539-4c03-b8e6-b075c3798b2a" alt="Club Stats" width="45%">
</p>

<p align="center">
  <img src=https://github.com/Vinayak1337/RelicsAudit/assets/34209962/e14d2ee4-b324-4702-b9ac-a4743a24d82b" alt="Club Logs">
</p> 

<p align="center">
  <img src=https://github.com/Vinayak1337/RelicsAudit/assets/34209962/893c05f8-0a1f-4053-bb29-b5485a2c2734" alt="Ban Logs">
</p>
</details>

### Ladder Management
- **Seasonal Tracking**: Monitors players from three countries who join before the ladder season starts.
  - Disqualifies players from ladder rewards if they switch clubs during the season.
  - Two minutes before the season's end, the bot creates a dedicated channel and role. It assigns this role to top-performing players and notifies admins about eligible players for rewards.
  - Five minutes post-notification, the bot resets logs for players already in a Relics club, ensuring the cycle continues seamlessly.

<details>
<summary>Ladder Management Screenshots</summary>
<p align="center">
  <img src="https://github.com/Vinayak1337/RelicsAudit/assets/34209962/632fa49d-6dad-415d-823e-1b6af20be36c" alt="Leaderboard" width="45%">
  <img src="https://github.com/Vinayak1337/RelicsAudit/assets/34209962/e7b424fc-8554-4fcd-a8a6-68f5ccb6843a" alt="Leaderboard" width="45%">
</p>

<p align="center">
  <img src=https://github.com/Vinayak1337/RelicsAudit/assets/34209962/38d82a25-1368-4e6a-b108-e4224c0f5b1d" alt="LB Results Announcement">
</p>

<p align="center">
  <img src="https://github.com/Vinayak1337/RelicsAudit/assets/34209962/8873a9c4-dcac-4705-985f-92c2f6fc99b6" alt="Channel & Roles Creation, Role assignment for the winners">
</p>

</details>

### Statistics
- Provides detailed statistics about players, the bot's performance, and club metrics through specific commands.

<details>
<summary>Statistics Screenshots</summary>
<p align="center">
  <img src="https://github.com/Vinayak1337/RelicsAudit/assets/34209962/89a2e833-c979-44db-b817-e563dde45ca4" alt="User stats UI over time" width="45%">
</p>

<p align="center">
  <img src="https://github.com/Vinayak1337/RelicsAudit/assets/34209962/6a03da80-c958-4e8a-bd90-5ece49445e98" alt="User stats UI over time" width="45%">
</p>

<p align="center">
  <img src="https://github.com/Vinayak1337/RelicsAudit/assets/34209962/656da582-448f-4977-be78-b391008eed7e" alt="User stats UI over time" width="45%">
</p>
</details>

### Verification System
- **Feeder System Integration**: Operates on verified clubs and servers.
  - Automatically verifies newcomers if their player ID exists in the database. It then updates their roles based on their current club and the server type (HUB, CLUB, or PARTNER).
  - For first-time verification, the bot requires the player's ID and Discord user ID. After this initial setup, users can self-verify, and newcomers are auto-verified.
  - Periodically audits the entire server to update user roles based on their current club and the server's context.

<details>
<summary>Verification System Screenshots</summary>
<p align="center">
  <img src="https://github.com/Vinayak1337/RelicsAudit/assets/34209962/99cd9504-ed9b-4cca-b0eb-3f551109a658" alt="Auto Verification" width="45%">
</p>

<p align="center">
  <img src="https://github.com/Vinayak1337/RelicsAudit/assets/34209962/a249a7a0-5f02-4554-986b-e2c13661d236" alt="User Verification" width="45%">
</p>

<p align="center">
  <img src="https://github.com/Vinayak1337/RelicsAudit/assets/34209962/1023f303-e5ad-419c-897c-80b78d91b95e" alt="Self re-Verification for role changes" width="45%">
</p>
</details>

