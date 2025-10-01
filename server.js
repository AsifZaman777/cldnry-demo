import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import cors from "cors";

dotenv.config();

//cloudinary config from env variable
const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (cloudinaryUrl) {
  const url = new URL(cloudinaryUrl);
  cloudinary.config({
    cloud_name: url.hostname,
    api_key: url.username,
    api_secret: url.password,
  });
} else {
  cloudinary.config();
}

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" }); // temporary local storage

// Serve static HTML from "public" folder
app.use(express.static("public"));

// Upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "Test",
      transformation: [
        { width: 500, height: 500, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    //delete temp file
    fs.unlinkSync(req.file.path);
    res.json({ url: result.secure_url });
    console.log("File uploaded to Cloudinary:", result.secure_url);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
