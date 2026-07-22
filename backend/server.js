import "dotenv/config";
import { app } from "./app.js";
import { checkDatabaseConnection } from "./database/db.js";

const port = Number(process.env.PORT ?? 4000);

try {
  await checkDatabaseConnection();
  app.listen(port, () => {
    console.log(`CafeX API running at http://localhost:${port}`);
  });
} catch (error) {
  if (error.code === "DB_CONFIG_NOT_SET") {
    console.error(error.message);
  } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
    console.error("MySQL rejected the credentials in backend/.env. Run `npm run db:setup` to configure them again.");
  } else {
    console.error("CafeX could not connect to MySQL. Make sure MySQL is running, then run `npm run db:setup`.");
    console.error(error.message);
  }
  process.exit(1);
}
