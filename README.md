# Relics Audit Discord Bot

Relics Audit is a Discord bot developed to manage and monitor the [Relics](https://twitter.com/@relics_global) Organisation's activities. It's built with Node.js and JavaScript, leveraging MongoDB for data storage and CRUD operations through the Mongoose library. The codebase adheres to the DRY (Don't Repeat Yourself) principle.

## Features

### Real-time Club Monitoring
- **Brawl Stars API Integration**: The bot fetches data from the Brawl Stars API every second to monitor changes in Relics clubs.
  - Detects new member arrivals and departures.
  - Tracks role and name modifications.
  - Monitors blacklisted members. If a blacklisted member joins any Relics club, the bot sends an alert on Discord and continues to ping every hour until the member is removed.
  - Updates club statistics and leaderboards on Discord in real-time when any changes occur in a Relics club.

![image](https://github.com/Vinayak1337/RelicsAudit/assets/34209962/00703433-c627-48f8-aa34-2749a0fa2765)

![image](https://github.com/Vinayak1337/RelicsAudit/assets/34209962/02cce930-8539-4c03-b8e6-b075c3798b2a)

![image](https://github.com/Vinayak1337/RelicsAudit/assets/34209962/e14d2ee4-b324-4702-b9ac-a4743a24d82b)

![image](https://github.com/Vinayak1337/RelicsAudit/assets/34209962/893c05f8-0a1f-4053-bb29-b5485a2c2734)




### Ladder Management
- **Seasonal Tracking**: Monitors players from three countries who join before the ladder season starts.
  - Disqualifies players from ladder rewards if they switch clubs during the season.
  - Two minutes before the season's end, the bot creates a dedicated channel and role. It assigns this role to top-performing players and notifies admins about eligible players for rewards.
  - Five minutes post-notification, the bot resets logs for players already in a Relics club, ensuring the cycle continues seamlessly.

![image](https://github.com/Vinayak1337/RelicsAudit/assets/34209962/632fa49d-6dad-415d-823e-1b6af20be36c)


### Statistics
- Provides detailed statistics about players, the bot's performance, and club metrics through specific commands.

### Verification System
- **Feeder System Integration**: Operates on verified clubs and servers.
  - Automatically verifies newcomers if their player ID exists in the database. It then updates their roles based on their current club and the server type (HUB, CLUB, or PARTNER).
  - For first-time verification, the bot requires the player's ID and Discord user ID. After this initial setup, users can self-verify, and newcomers are auto-verified.
  - Periodically audits the entire server to update user roles based on their current club and the server's context.
