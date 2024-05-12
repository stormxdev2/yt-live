const { spawn } = require('child_process');
const { google } = require('googleapis');
const http = require('http');
const openradio = require('openradio');
const ytdl = require('ytdl-core');

// Function to install ffmpeg using apt via nix-shell
const installFFmpeg = () => {
  return new Promise((resolve, reject) => {
    const installProcess = spawn('nix-shell', ['--run', 'apt update && apt install -y ffmpeg']);

    installProcess.on('close', (code) => {
      if (code === 0) {
        console.log('ffmpeg installed successfully.');
        resolve();
      } else {
        console.error('Failed to install ffmpeg.');
        reject(new Error('Failed to install ffmpeg.'));
      }
    });

    installProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
  });
};

// Function to start live broadcast
const startLiveStream = async (videoId) => {
  // Your code to start live stream using YouTube API
};

// Function to play YouTube video as a live stream
const playYouTubeVideo = async (videoId) => {
  try {
    // Install ffmpeg before proceeding
    await installFFmpeg();

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const stream = ytdl(videoUrl, { quality: 'highestaudio' });
    const radio = openradio();
    const repeater = openradio.repeater(radio);

    const ffmpegProcess = spawn('ffmpeg', [
      '-i', '-', '-f', 'mp3', '-c:a', 'libmp3lame', '-ar', '44100', '-b:a', '192k', 'pipe:1'
    ]);

    http.createServer((req, res) => {
      res.setHeader('content-type', 'audio/mp3');
      if (radio.header) res.write(radio.header);
      repeater(res, ffmpegProcess.stdin);
    }).listen(process.env.PORT || 3000);

    radio.play(stream);
    console.log(`Playing YouTube video: https://www.youtube.com/watch?v=${videoId}`);

    // Start the live broadcast after a short delay (e.g., 5 seconds)
    setTimeout(() => {
      startLiveStream(videoId);
    }, 5000);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Replace 'YOUR_YOUTUBE_VIDEO_ID' with the actual YouTube video ID
const VIDEO_ID = '-p5NXiuZydw'; // Replace with your YouTube video ID
playYouTubeVideo(VIDEO_ID);
