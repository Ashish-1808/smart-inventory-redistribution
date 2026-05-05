const db = require("./config/database");
(async () => {
  try {
    const result = await db.query("SELECT NOW()");
    console.log("DB Conected:", result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error("DB Conection Failed", err);
    process.exit(1);
  }
})();
