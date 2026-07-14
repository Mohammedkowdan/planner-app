const bcrypt = require('bcryptjs');
const fs = require('fs');

async function main() {
  const hash = await bcrypt.hash("Mohammed?@123456789(*&^%$#@!", 12);
  const sql = `UPDATE "User" SET password = '${hash}' WHERE email = 'admin@example.com';`;
  fs.writeFileSync('update.sql', sql);
}

main();
