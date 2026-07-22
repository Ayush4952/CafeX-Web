# MySQL Workbench setup

CafeX uses MySQL 8 through the `mysql2` Node.js driver. No PostgreSQL database
or PostgreSQL administration tool is required.

1. Open MySQL Workbench and connect to your local MySQL 8 server.
2. Choose **File → Open SQL Script** and open `../schema.sql`.
3. Click the lightning-bolt **Execute** button to create the `cafex` schema and
   its tables.
4. Open `../seed.sql` and execute it to add the starter categories and menu.
5. Refresh the **SCHEMAS** panel. Expand `cafex` to inspect the tables and data.
6. Copy `backend/.env.example` to `backend/.env`, then use the same host, port,
   username, and password as your Workbench connection.

Both SQL files are safe to run again: the schema uses `IF NOT EXISTS`, and the
seed data updates matching menu records instead of creating duplicates.
