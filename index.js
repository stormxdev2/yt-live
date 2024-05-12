const { google } = require('googleapis');
const http = require('http');
const openradio = require('openradio');
const ytdl = require('ytdl-core');

// Load environment variables if necessary (dotenv)
// require('dotenv').config();

// Initialize YouTube API client
const youtube = google.youtube({
  version: 'v3',
  // Use environment variable for YouTube API key if applicable
  // auth: process.env.YOUTUBE_API_KEY
});

// Stream key for broadcasting (replace with your stream key)
const STREAM_KEY = 'q3wa-abb3-8yzw-rszy-av70';

// Function to start live broadcast
const startLiveStream = async (videoId) => {
  try {
    // Create a live broadcast
    const { data: { id: broadcastId } } = await youtube.liveBroadcasts.insert({
      part: 'snippet,status,contentDetails',
      requestBody: {
        snippet: {
          title: '24/7 Live Stream',
          scheduledStartTime: new Date().toISOString(),
          description: 'Continuous live stream using a YouTube video'
        },
        status: {
          privacyStatus: 'public'
        },
        contentDetails: {
          monitorStream: {
            enableMonitorStream: false
          },
          enableDvr: true
        }
      }
    });

    // Bind the broadcast to the specified video and stream key
    await youtube.liveBroadcasts.bind({
      part: 'id,contentDetails',
      id: broadcastId,
      streamId: STREAM_KEY
    });

    console.log(`Live stream started: https://www.youtube.com/watch?v=${videoId}`);
  } catch (error) {
    console.error('Error starting live stream:', error.message);
  }
};

// Function to play YouTube video as a live stream
const playYouTubeVideo = (videoId) => {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const stream = ytdl(videoUrl, { quality: 'highestaudio' });
  const radio = openradio();
  const repeater = openradio.repeater(radio);

  http.createServer((req, res) => {
    res.setHeader('content-type', 'audio/mp3');
    if (radio.header) res.write(radio.header);
    repeater(res);
  }).listen(process.env.PORT || 3000);

  radio.play(stream);
  console.log(`Playing YouTube video: https://www.youtube.com/watch?v=${videoId}`);

  // Start the live broadcast after a short delay (e.g., 5 seconds)
  setTimeout(() => {
    startLiveStream(videoId);
  }, 5000);
};

// Replace 'YOUR_YOUTUBE_VIDEO_ID' with the actual YouTube video ID
const VIDEO_ID = '-p5NXiuZydw';
playYouTubeVideo(VIDEO_ID);
