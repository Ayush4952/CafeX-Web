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
  console.error("CafeX could not connect to MySQL. Check backend/.env and run database/schema.sql in MySQL Workbench.");
  console.error(error.message);
  process.exit(1);
}
