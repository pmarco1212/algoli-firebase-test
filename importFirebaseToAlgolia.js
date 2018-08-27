var dotenv = require('dotenv');
var firebaseAdmin = require("firebase-admin");
var algoliasearch = require('algoliasearch');

// load values from the .env file in this directory into process.env
dotenv.load();

//var serviceAccount = require("./serviceAccountKey.json");
var private_key_nottrim=process.env.FIREBASE_PRIVATE_KEY;
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
        "type": process.env.FIREBASE_TYPE,
        "project_id": process.env.FIREBASE_PROJECT_ID,
        "private_key_id": process.env.FIREBASE_KEY_ID,
        "private_key": private_key_nottrim.replace(/\\n/g, '\n'),
        "client_email": process.env.FIREBASE_CLIENT_EMAIL,
        "client_id": process.env.FIREBASE_CLIENT_ID,
        "auth_uri": process.env.FIREBASE_AUTH_URI,
        "token_uri": process.env.FIREBASE_TOKEN_URI,
        "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL
    }),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});
var database = firebaseAdmin.database();

var algolia = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
var index = algolia.initIndex('eventApp');

var contactsRef = database.ref("/");
contactsRef.once('value', initialImport);
function initialImport(dataSnapshot) {
  // Array of data to index
  var objectsToIndex = [];
  // Get all objects
  var values = dataSnapshot.val();
  // Process each child Firebase object
  dataSnapshot.forEach((function(childSnapshot) {
    // get the key and data from the snapshot
    var childKey = childSnapshot.key;
    var childData = childSnapshot.val();
    // Specify Algolia's objectID using the Firebase object key
    childData.objectID = childKey;
    // Add object for indexing
    objectsToIndex.push(childData);
  }))
  // Add or update new objects
  index.saveObjects(objectsToIndex, function(err, content) {
    if (err) {
      throw err;
    }
    console.log('Firebase<>Algolia import done');
    process.exit(0);
  });
}
