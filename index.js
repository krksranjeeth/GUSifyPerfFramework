console.log("Welcome to GUSify Perf Framework");

const express = require('express');

const sf = require("./src/utils/sf");

const app = express();

const path = require('path');

app.set("views", "./views");

app.enable('trust proxy');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,'src/public')));

const work = require("./src/routes/work.js");
app.use("/work", work);

app.get('/', function (req, res) {
  res.send("Welcome to GUSify Perf Framework")
});

let port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on the port ${port}`));


