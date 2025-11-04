const db = require('./db');

const checkSchema = async () => {
  try {
    console.log('Checking database schema...\n');

    const tables = ['songs', 'lyrics', 'photos', 'videos'];

    for (const table of tables) {
      console.log(`\n=== ${table.toUpperCase()} TABLE ===`);
      try {
        const [columns] = await db.query(`DESCRIBE ${table}`);
        console.table(columns);
      } catch (error) {
        console.log(`Table ${table} does not exist or error: ${error.message}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkSchema();
