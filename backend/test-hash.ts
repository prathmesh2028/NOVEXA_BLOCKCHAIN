import * as bcrypt from 'bcryptjs';

async function main() {
  const password = 'password';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash for "password":', hash);

  const fallbackHash = '$2a$10$wT28t/4t.eZ8R9h0zN8WReK9Jm0v8t6s1K8m7y6d5e4r3q2w1e0r9';
  const match = await bcrypt.compare(password, fallbackHash);
  console.log('"password" matches fallback hash:', match);
}

main().catch(console.error);
