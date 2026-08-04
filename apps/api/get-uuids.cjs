const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.dykisezsniqhhgqyuane:AnexSalon%402026@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require' });
async function main() {
  await client.connect();
  const branch = await client.query('SELECT id FROM "Branch" LIMIT 1');
  console.log('Branch ID:', branch.rows[0]?.id);
  const customer = await client.query('SELECT id FROM "Customer" LIMIT 1');
  console.log('Customer ID:', customer.rows[0]?.id);
  const employee = await client.query('SELECT id FROM "Employee" LIMIT 1');
  console.log('Employee ID:', employee.rows[0]?.id);
  await client.end();
}
main().catch(console.error);
