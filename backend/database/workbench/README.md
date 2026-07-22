# MySQL Workbench setup

CafeX uses MySQL 8 through the `mysql2` Node.js driver. No PostgreSQL database
or PostgreSQL administration tool is required.

1. Make sure Workbench's **Local instance 3306** MySQL server is running.
2. From the `backend` folder, run `npm run db:setup`.
3. Enter the Local instance root password when prompted. The input is hidden,
   used only during setup, and is never written to disk.
4. Refresh the **SCHEMAS** panel. Expand `cafex` to inspect the tables and data.

The setup command runs `schema.sql` and `seed.sql`, creates a restricted
`cafex_app` user, and stores that app user's generated password in the ignored
`backend/.env` file. Both SQL files remain safe to execute manually if needed.

Both SQL files are safe to run again: the schema uses `IF NOT EXISTS`, and the
seed data updates matching menu records instead of creating duplicates.
