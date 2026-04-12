const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function test() {
  try {
    // 1. Create a dummy test image
    fs.writeFileSync('test.jpg', 'fake image data');

    // 2. We need a token. We can register a test user first.
    const resReg = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'test', email: 'test1@test.com', password: 'test', role: 'admin'
    }).catch(err => {
      // If already registered, login
      return axios.post('http://localhost:5000/api/auth/login', {
        email: 'test1@test.com', password: 'test'
      });
    });

    const token = resReg.data.token;
    console.log("Got token:", token.substring(0, 10) + '...');

    // 3. Make analyze request
    const form = new FormData();
    form.append('image', fs.createReadStream('test.jpg'));

    const res = await axios.post('http://localhost:5000/api/analysis/analyze', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Success:", res.status);
  } catch (error) {
    console.error("Error occurred:", error.response ? error.response.data : error.message);
  }
}
test();
