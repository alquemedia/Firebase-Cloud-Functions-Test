const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// When a notification is written to the database...
exports.onNotificationWritten =functions.database.ref('/notifications/{recordId}')
    .onWrite( event => {
        // Grab newly written record
        const record =event.data.val();

        // write it to console
        console.log(`Record ${event.params.recordId}`,record);

        // Notification details.
        const payload = {
            notification: {
                title: 'You have a new follower!',
                body: `null is now following you.`
            }
        };

        // Send notifications to all tokens.
        var token = 'cGotuTifDcU:APA91bFx917LgLFTZlPW3bhSRcmPEspReAWd7RPdqA9CSxTKEj94iHCcHe4Cx-wObSl_zoS8DWDg-GGO5woudsu8ZidD7kRgfgifRqMABdJh3S_2nujWplkw9fIDivb314Dw7iG7EoGh';

        return admin.messaging().sendToDevice(token, payload).then(response => {
            console.log("message response",response);
        });
    });

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
        // Grab the text parameter.
        const original = req.query.text;
// Push it into the Realtime Database then send a response
admin.database().ref('/messages').push({original: original}).then(snapshot => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    res.redirect(303, snapshot.ref);
  });
});

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
    .onWrite(event => {
        // Grab the current value of what was written to the Realtime Database.
        const original = event.data.val();
        console.log('Uppercasing', event.params.pushId, original);
        const uppercase = original.toUpperCase();
        // You must return a Promise when performing asynchronous tasks inside a Functions such as
        // writing to the Firebase Realtime Database.
        // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
        return event.data.ref.parent.child('uppercase').set(uppercase);
    });