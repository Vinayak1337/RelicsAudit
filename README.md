# relics-audit

A discord bot for managing [Relics](https://twitter.com/@relics_global) Organisation.

Written in Node.js & JavaScript.
Used mongodb for the database and doing CRUD operations via mongoose library.
The code is written dry.

Test out the bot [here](https://discord.gg/TXvxyR9).

Features:-

It pulls relics clubs data from brawl stars api every second and watch the changes.
 - If a new member has Joined
 - Someone left the club
 - Role & name changes
 - If a blacklisted member has entered any relics club
   (If entered, it notifies quickly on the discord and keeps pinging until he's kicked every hour.)
 - Keeps updating club stats page on the discord & Leaderboard page whenever there's any change in any relics club.

Ladder Management
 - It keeps track of every player who have joined before ladder season start of 3 countries.
 - It removes those players from eligibility of ladder reward who has changed the club
 - 2 minutes before season end, creates a channel and a role then assigns the role to the top eligible players and notifies the admins in created channel about the qualified players.
 - After notifying after 5 mins it resets the logs of all the players who are already joined any relics club. And cycle keeps repeating

Stats
- It also shows statistics about the players, bot and club via commands

Verification System
- Works on verified clubs & server with feader system.
- Auto verifies the new commers of the server if their player id is saved in database & updates their roles according to club in which they are in and according to the server type ( HUB, CLUB & PARTNER)
- It just asks for player id and discord user id to verify them in the server for first time. After this they can self verify & new comers gets automatically verified.
- It also audits the whole server and updates their roles according to the club they are in and the server it is performing.