// using global fetch

async function test() {
  const loginRes = await fetch('http://localhost:8000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'tech@bel.in', password: 'password' })
  });
  const loginData = await loginRes.json();
  console.log('Login Status:', loginRes.status);
  console.log('Token:', loginData.access_token);

  if (loginData.access_token) {
    const meRes = await fetch('http://localhost:8000/api/v1/auth/me', {
      headers: { 'Authorization': `Bearer ${loginData.access_token}` }
    });
    console.log('Me Status:', meRes.status);
    console.log('Me Data:', await meRes.text());
  }
}

test();
