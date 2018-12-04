console.log("Welcome to GUSify Perf Framework");

const express = require('express');

const sf = require("./src/utils/sf");

const app = express();

app.enable('trust proxy');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const work = require("./src/routes/work.js");
app.use("/work", work);

app.get('/', function (req, res) {
  res.send("Welcome to GUSify Perf Framework")
});


let port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on the port ${port}`));


