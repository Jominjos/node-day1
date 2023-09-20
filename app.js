const archiver = require("archiver");
const path = require("path");
const express = require("express");
const app = express();
const bodyparser = require("body-parser");
let fs = require("fs");
let formdata = [];

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.get("/api/db", (req, res, next) => {
  fs.readdir(path.join(__dirname, "files"), (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res.status(500).json({ error: "Server Error" });
    }
    res.send({ files });
  });
});

app.get("/api/db/download", (req, res, next) => {
  const archive = archiver("zip");

  res.attachment("files.zip");
  archive.pipe(res);

  archive.directory(path.join(__dirname, "files"), "files");
  archive.finalize();
});

app.use(["/add"], (req, res, next) => {
  res.sendFile(path.join(__dirname, "public", "form.html"));
});

app.post(["/store"], async (req, res, next) => {
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getSeconds()).padStart(2, "0");

  const time = `${year}_${month}_${day}-${hours}_${minutes}_${seconds}.txt`;
  const bodydetails = JSON.stringify(req.body);
  fs.writeFileSync(
    path.join(__dirname, "files", time),
    ` ${currentDate} ${bodydetails}`,
    (err) => {
      if (err) console.log(err);
    }
  );
  // store data in database or file
  if (req.body.age && req.body.productName) {
    formdata.push(req.body);
    console.log(formdata);
    res.send(`form submitted sucessfully`);
  } else {
    res.status(400).send("enter valid details");
  }
});

app.use("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.listen(process.env.PORT_NUMBER || 3002);
