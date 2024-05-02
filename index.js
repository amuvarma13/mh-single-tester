
const { WebSocketServer } = require('ws');
const axios = require('axios');
const remoteUrl = "http://34.32.228.101:8080/generate_animation";
const wss = new WebSocketServer({ host: '0.0.0.0', port: 8080 });
console.log('Server started');
const allConnections = [];
wss.on('connection', (ws) => {
    console.log('A client connected');
    allConnections.push(ws);

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        if(!message.length.contains("{")){
            printInputTextAndSendRequest(message);
        }
    });

    ws.on('close', () => {
        console.log('A client disconnected');
    });
});

function printInputTextAndSendRequest(text) {
    text = Buffer.from(text, 'utf8').toString() // Print the text from the input to the console

    // Construct the URL with the query parameter
    const url = new URL(remoteUrl);

    const inputData = JSON.stringify({ 
        text: text, 
        isFirstChunk: true, 
        // emotion_vector:[0,0,1,0]
    })

    // Send a GET request to the server
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: inputData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text(); // or response.json() if your server responds with JSON
        })
        .then(data => {
            console.log(data);
            const { b64string, visemes, TTSSentence } = JSON.parse(data);

            // Construct the message to send to the client
            const currentConversationIndex = 0;
            const message = {
                messageType: "animationData",
                audioData:b64string,
                visemes,
                conversationIndex: currentConversationIndex,
                uuid: "1234",
                TTSSentence:text
            }

            console.log(message);

            

            for (let i = 0; i < allConnections.length; i++) {
                allConnections[i].send(JSON.stringify(message));
            }

        })
        .catch(error => {
            console.log('There has been a problem with your fetch operation:', error);
        });
}
