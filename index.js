const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const openradio = require('openradio'); // Assuming this is used for streaming
const ytdl = require('ytdl-core');
require('dotenv').config();

// Load environment variables from .env file
const { CLIENT_ID, CLIENT_SECRET } = process.env;

// Configure OAuth2 client
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, 'urn:ietf:wg:oauth:2.0:oob');

// OAuth2 URL for user consent
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline', // Enables refresh token
  scope: ['https://www.googleapis.com/auth/youtube.force-ssl'] // Specify required scopes
});

console.log('Authorize this app by visiting this URL:', authUrl);

// Replace <AUTHORIZATION_CODE> with the actual authorization code obtained manually
const authorizationCode = '<AUTHORIZATION_CODE>';

// Function to exchange authorization code for access token
async function getAccessToken() {
  try {
    const { tokens } = await oAuth2Client.getToken(authorizationCode);
    console.log('Access token:', tokens.access_token);

    // Use the access token to start the live stream
    const youtube = google.youtube({
      version: 'v3',
      auth: oAuth2Client
    });

    // Get YouTube video info (replace with your video URL)
    const videoUrl = 'https://www.youtube.com/watch?v=-p5NXiuZydw';
    const videoInfo = await ytdl.getInfo(videoUrl);

    // Start the live stream
    const liveBroadcastResponse = await youtube.liveBroadcasts.insert({
      part: ['snippet,status'],
      requestBody: {
        snippet: {
          title: 'My Live Stream',
          description: '24/7 live stream using YouTube API'
        },
        status: {
          privacyStatus: 'public'
        }
      }
    });

    const broadcastId = liveBroadcastResponse.data.id;
    const streamUrl = `https://www.youtube.com/watch?v=${broadcastId}`;

    // Use openradio (or equivalent) to stream to YouTube
    const radio = new openradio({
      url: streamUrl,
      stream: videoInfo.formats[0].url // Use the first available format URL for streaming
    });

    radio.on('error', (err) => {
      console.error('Error starting live stream:', err);
    });

    radio.on('stream-start', () => {
      console.log('Live stream started successfully!');
    });

    radio.start();
  } catch (error) {
    console.error('Error retrieving access token:', error.message);
  }
}

getAccessToken(); // Call the function to retrieve access token
