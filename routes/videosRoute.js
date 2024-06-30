const express = require("express");
const router = express.Router();


const {
  getAllVideos,
  likeVideo,
  subscribeVideo,
  getPlaylists,
} = require("../controllers/videosController");

router.get("/", getAllVideos);
router.get('/', getPlaylists);
router.post('/like', likeVideo);
router.post('/subscribe', subscribeVideo);

module.exports = router;
