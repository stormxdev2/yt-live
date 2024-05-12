const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');

// Load environment variables from .env file
require('dotenv').config();

// OAuth 2.0 credentials
const credentials = {
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_uris: ['urn:ietf:wg:oauth:2.0:oob'],
};

// Create an OAuth2 client with the given credentials
const auth = new google.auth.OAuth2(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[0]
);

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to authorize the application and obtain an access token
const authorize = async () => {
  const authUrl = auth.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.force-ssl'],
  });

  console.log('Authorize this app by visiting this URL:', authUrl);

  rl.question('Enter the code from the authorization page here: ', async (code) => {
    try {
      const { tokens } = await auth.getToken(code);
      console.log('Access token:', tokens.access_token);

      // Call the function to start the live streaming with the obtained access token
      await startLiveStreaming(tokens.access_token);

      rl.close();
    } catch (error) {
      console.error('Error retrieving access token:', error);
    }
  });
};

// Function to start the live streaming using the obtained access token
const startLiveStreaming = async (accessToken) => {
  const youtube = google.youtube({
    version: 'v3',
    auth: accessToken,
  });

  const videoUrl = 'https://www.youtube.com/watch?v=-p5NXiuZydw';

  try {
    const response = await youtube.liveBroadcasts.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: 'Live Stream Title',
          description: 'Live stream description',
        },
        status: {
          privacyStatus: 'public',
        },
      },
    });

    console.log('Live broadcast created:', response.data);

    const { id } = response.data;
    const streamUrl = await youtube.liveStreams.insert({
      part: 'snippet,cdn',
      requestBody: {
        snippet: {
          title: 'Live Stream Title',
        },
        cdn: {
          resolution: 'variable',
          ingestionType: 'rtmp',
        },
      },
    });

    console.log('Stream created:', streamUrl.data);

    const { streamUrl, streamName } = streamUrl.data.cdn.ingestionInfo;

    // Use the stream URL and stream name to start streaming
    console.log(`Start streaming to: ${streamUrl}/${streamName}`);
  } catch (error) {
    console.error('Error starting live stream:', error);
  }
};

// Call the authorization function to start the process
authorize().catch(console.error);
