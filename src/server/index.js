require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", express.static(path.join(__dirname, "../public")));

// your API calls
app.get("/photos/:rover", async (req, res) => {
  const getRoverPhotosUrl = (rover) =>
    `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=${process.env.API_KEY}`;
  const { rover } = req.params;

  try {
    let photos = await fetch(getRoverPhotosUrl(rover)).then(res =>
      res.json()
    );
    res.send({ photos });
  } catch (err) {
    console.log("error:", err);
  }
});

app.get("/manifest/:rover", async (req, res) => {
  const getRoverManifestUrl = rover =>
    `https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${process.env.API_KEY}`;
  const { rover } = req.params;

  try {
    let manifest = await fetch(getRoverManifestUrl(rover)).then(res =>
      res.json()
    );
    res.send({ manifest });
  } catch (err) {
    console.log("error:", err);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
