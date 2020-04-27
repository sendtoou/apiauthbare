const express = require('express')
const PORT = 5000
const axios = require('axios');
const jwt = require('jsonwebtoken')
const cors = require('cors');
// const access_token = new Set();
// const id_token = new Set();
let access_token
let id_token
const lineData = new Set();

const app = express();
app.set('view engine', 'ejs');
app.use(cors())
const appId = process.env.LI_CLIENT_ID
const appSecret = process.env.LI_CILENT_SECRET




// Route 1: UI to redirect the user to Line's login dialog
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <a href="https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${appId}&r
edirect_uri=${encodeURIComponent('http://localhost:5000/auth/line/redirect')}&state=123abc&scope=openid profile">
          Log In With Line
        </a>
      </body>
    </html>
  `);
});

// Route 2: Exchange auth code for access token and verify id_token(to get user profile)
app.get('/auth/line/redirect', async (req, res) => {

  try {
    const authCode = req.query.code; 
    console.log('naja',authCode)

  /* axois by default it does not converts data to query string */
    const reqData = 'grant_type=authorization_code&' +
      `code=${encodeURIComponent(authCode)}&` +
      `redirect_uri=${encodeURIComponent('http://localhost:5000/auth/line/redirect')}&` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}`;

    const lineToken = await axios({
      method: 'post',
      url: 'https://api.line.me/oauth2/v2.1/token',
      withCredentials: true,
      crossdomain: true,
      data: reqData,    
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    .then((res) => {
      console.log("Response from line naja: ", res.data);
      // Store the token in memory for now. Later will store it in the database.
      lineData.add(res.data);
      access_token = res.data['access_token']
      id_token = res.data['id_token']
      console.log(access_token)
      console.log(id_token)
    })
    .catch((err) => {
      console.log("AXIOS ERROR naja: ", err);
    })

     /* verify id_token */
     const reqData2 = 'id_token='+`${id_token}&` + `client_id=${appId}`;
     console.log('resdata2:',reqData2)
     const verifyToken = await axios({
       method: 'post',
       url: 'https://api.line.me/oauth2/v2.1/verify',
       withCredentials: true,
       crossdomain: true,
       data: reqData2
     })
     .then((res) => {
       console.log("Response verifyToken: ", res);

     })
     .catch((err) => {
       console.log("AXIOS VERIFY TOKEN ERROR naja: ", err);
     })

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.response.data || err.message });
  }
});

// Route 3: Make requests to line on behalf of the user


app.listen(PORT)
console.log('Server listening on port naja:' + PORT)