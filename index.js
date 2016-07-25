var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 8080));

// Server frontpage
app.get('/', function (req, res) {
    res.send('Hola soy un Bot de Facebook Messenger :)');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Token de seguridad inválido');
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
                //sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
                sendMessage(event.sender.id, {text: "Por favor escribe el comando 'ayuda' (sin las comillas), para Ver los Comandos disponibles."});
            }
        }
    }
    res.sendStatus(200);
});

function newResponse(recipientId, text) {
    text = text || "";
    var buscar = text.match(/buscar/gi);
    var ux = text.match(/ux/gi);
    var blog = text.match(/blog/gi);
    var php = text.match(/php/gi);
    var android = text.match(/android/gi);
    var javascript = text.match(/javascript/gi);
    var python = text.match(/python/gi);
    var ruby = text.match(/ruby/gi);
    if(buscar != null && blog != null) {
        var query = "";

        //sendMessage(recipientId, message);
        if(android != null) {
            query = "Android";
        } else if (javascript != null) {
            query = "Javascript";
        } else if (php != null) {
            query = "PHP";
        } else if (ux != null) {
            query = "UX";
        } else if (python != null) {
            query = "Python";
        } else if (ruby != null) {
            query = "Ruby";
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
          text: "Resultados de "+query+":",
          buttons:[{
            type: "web_url",
            url: "https://platzi.com/blog/?s="+query,
            title: "Platzi Blog: "\n + query
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

      console.log("Se ha enviado el mensaje generado con id %s a %s", 
        messageId, recipientId);
    } else {
      console.error("No se puede enviar mensajes.");
      console.error(response);
      console.error(error);
    }
  });  
}

function introResponse(recipientId, text) {
    text = text || "";
    //split text into words for conditional responses
    //var values = text.split(" ");
    var sobre = text.match(/sobre/gi);
    var platzi = text.match(/platzi/gi);
    var ayuda = text.match(/ayuda/gi);
    var buscar = text.match(/buscar/gi);
    var ux = text.match(/ux/gi);
    var blog = text.match(/blog/gi);
    var php = text.match(/php/gi);
    var android = text.match(/android/gi);

    if(sobre != null && platzi != null) {
        message = {
            text: "Platzi es la mejor plataforma de habla hispana con Cursos profesionales de desarrollo web y de apps, marketing online, diseño de interfaces, servidores. Con clases en vivo y profesores sabios de la industria. Bienvenido :)."
        }
        sendMessage(recipientId, message);
        return true;
    }
    if(ayuda != null) {
        message = {
            text: "Platzi Bot Ver. 1.0 "+ "\n" +" Comandos disponibles: "+ "\n" +" 1)Buscar blog Javascript, etc.(Puedes buscar Android, Javascript, PHP, UX, Python, Ruby) "+ "\n" +" 2)Sobre Platzi. "+ "\n" +" 3)Ayuda."
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
            console.log('Error enviando el Mensaje: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};