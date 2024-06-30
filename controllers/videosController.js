const asyncHandler = require("express-async-handler");
const axios = require('axios');
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;


const getAllVideos = asyncHandler(async (req, res) => {
  const query = req.query.q || '';
  const playlistId = req.query.playlistId || '';

  try {
    const params = {
      part: 'snippet',
      channelId: CHANNEL_ID,
      maxResults: 10,
      q: query,
      type: 'video',
      key: YOUTUBE_API_KEY,
    };

    if (playlistId) {
      params.playlistId = playlistId;
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', { params });

    if (response && response.data && response.data.items) {
      res.json(response.data.items);
    } else {
      res.status(500).send('Failed to retrieve video data from YouTube');
    }
  } catch (error) {
    console.error('Error fetching videos:', error.response ? error.response.data : error.message);
    res.status(500).send('Internal Server Error');
  }
});

const likeVideo = asyncHandler((req, res) => {
    const { videoId } = req.body;
    console.log(req.body); // Log request body for debugging
    if (!videoId) {
      console.error('videoId is missing');
      return res.status(400).json({ error: 'videoId is required' });
    }
    res.json({ message: `Video's liked successfully!` });
  });

const subscribeVideo = asyncHandler((req, res) => {
    const { channelId } = req.body;
    console.log(req.body); // Log request body for debugging
    if (!channelId) {
      console.error('channelId is missing');
      return res.status(400).json({ error: 'channelId is required' });
    }
    res.json({ message: `Channel's Subscribed successfully!` });
  });


const getPlaylists = asyncHandler( async (req, res) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
      params: {
        part: 'snippet',
        channelId: CHANNEL_ID,
        maxResults: 10,
        key: YOUTUBE_API_KEY,
      },
    });

    if (response && response.data && response.data.items) {
      res.json(response.data.items);
    } else {
      res.status(500).send('Failed to retrieve playlist data from YouTube');
    }
  } catch (error) {
    console.error('Error fetching playlists:', error.response ? error.response.data : error.message);
    res.status(500).send('Internal Server Error');
  }
});


  module.exports = {
    getAllVideos,
    likeVideo,
    subscribeVideo,
    getPlaylists,
  };
  