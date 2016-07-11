var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 8080));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            if(introResponse(event.sender.id, event.message.text)) {
                res.sendStatus(200);
            }
            else if(newResponse(event.sender.id, event.message.text)) {
                res.sendStatus(200);
            }
            else {
              //replace echo with valid command list
                sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
            }
        }
    }
    res.sendStatus(200);
});

function newResponse(recipientId, text) {
    text = text || "";
    var suggest = text.match(/suggest/gi);
    var random = text.match(/random/gi);
    var article = text.match(/article/gi);
    var iphone = text.match(/iphone/gi);
    var android = text.match(/android/gi);
    var mac = text.match(/mac/gi);
    var browser = text.match(/browser/gi);
    var vpn = text.match(/vpn/gi);
    if(suggest != null && article != null) {
        var query = "";

        //sendMessage(recipientId, message);
        if(android != null) {
            query = "Android";
        } else if (mac != null) {
            query = "Mac";
        } else if (iphone != null) {
            query = "iPhone";
        }
        sendButtonMessage(recipientId, query);
        return true
    }
    return false;
};

function sendButtonMessage(recipientId, query) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Resultados de tu búsqueda: "+query,
          buttons:[{
            type: "web_url",
            url: "https://platzi.com/blog/?s="+query,
            title: "Platzi: " + query
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

function introResponse(recipientId, text) {
    text = text || "";
    //split text into words for conditional responses
    //var values = text.split(" ");
    var what = text.match(/what/gi);
    var platzi = text.match(/platzi/gi);
    var who = text.match(/who/gi);
    var you = text.match(/you/gi);
    var suggest = text.match(/suggest/gi);
    var random = text.match(/random/gi);
    var article = text.match(/article/gi);
    var iphone = text.match(/iphone/gi);
    var android = text.match(/android/gi);

    if(what != null && platzi != null) {
        message = {
            text: "Platzi es la mejor plataforma de habla hispana con Cursos profesionales de desarrollo web y de apps, marketing online, diseño de interfaces, servidores. Con clases en vivo y profesores sabios de la industria. Bienvenido :)."
        }
        sendMessage(recipientId, message);
        return true;
    }
    if(who != null && you != null) {
        message = {
            text: "I have been asked not to discuss my identity online."
        }
        sendMessage(recipientId, message);
        return true;
    }
    return false;
};

// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};