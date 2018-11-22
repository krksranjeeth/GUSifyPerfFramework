console.log("Welcome to GUSify Perf Framework");

const express = require('express');
const app = express();

let port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on the port ${port}`));

app.get("/", function(request, response) {
    response.send("Hello");
})