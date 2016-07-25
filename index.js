var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 8080)); // Indispensable colocar el puerto 8080 para correr la aplicación en heroku

// Imprimo un texto en el home de mi servidor Heroku para comprobar si mi deployment se hizo correctamente
app.get('/', function (req, res) {
    res.send('Hola soy un Bot de Facebook Messenger :)');
});

// Conecto a mi Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Token de seguridad inválido');
    }
});

// Le muestro un mensaje de ayuda para usar el bot
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
              //Si el usuario escribe un mensaje le muestro una guia de uso del bot
                sendMessage(event.sender.id, {text: "Por favor escribe el comando 'ayuda' (sin las comillas), para Ver los Comandos disponibles."});
            }
        }
    }
    res.sendStatus(200);
});

// Defino las palabras que puede usar el usuario dentro del Messenger para el comando 'busca blog' , ejemplo: 'buscar blog javascript'
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

// Muestro un Boton el cual es un link al Blog de Platzi con los resultados obtenidos
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
            title: "Platzi: " + query
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

// Valido la conexion a la Graph API de Facebook
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

// Defino las respuestas para los comandos 'sobre platzi', 'ayuda'
function introResponse(recipientId, text) {
    text = text || "";

    var sobre = text.match(/sobre/gi);
    var platzi = text.match(/platzi/gi);
    var ayuda = text.match(/ayuda/gi);
    var testimonios = text.match(/testimonios/gi);

    if(sobre != null && platzi != null) {
        message = {
            text: "Platzi es la mejor plataforma de habla hispana con Cursos profesionales de desarrollo web y de apps, marketing online, diseño de interfaces, servidores. Con clases en vivo y profesores sabios de la industria. Bienvenido :)."
        }
        sendMessage(recipientId, message);
        return true;
    }
    if(ayuda != null) {
        message = {
            text: "Platzi Bot Ver. 1.0 "+ "\n" +" Comandos disponibles: "+ "\n" +" 1)Buscar blog Javascript, etc.(Puedes buscar Android, Javascript, PHP, UX, Python, Ruby) "+ "\n" +" 2)Sobre Platzi. "+ "\n" +" 3)Testimonios. "+ "\n" +" 4)Ayuda."
        }
        sendMessage(recipientId, message);
        return true;
    }
    
    return false;
};


// Defino el comando 'testimonios'
function newResLnk(recipientId, text) {
    text = text || "";
    var testimonios = text.match(/testimonios/gi);

    if(testimonios != null) {
        var query = "";

        //sendMessage(recipientId, message);
        if(testimonios != null) {
            query = "Historias";
        } 
        sendButtonMessage(recipientId, query);
        return true
    }
    return false;
};

// Muestro los los wildcards con los 'testimonios'
function sendButMsge(recipientId, query) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "La Receta para mantenerse actualizado.",
                    "subtitle": "Es increíble cómo la formación profesional técnica puede motivarte a participar y aportar en el proceso de...",
                    "image_url": "https://static.platzi.com/static/stories/images/gollum-card.3cbc54914d6f.png",
                    
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://platzi.com/historias/la-receta-para-mantenerse-actualizado/",
                        "title": "Leer más (+)"
                    }, {
                        "type": "web_url",
                        "url": "platzi.com/historias",
                        "title": "Ver más Historias..."
                    }],
                }, {
                    "title": "Platzi me ayudó a crecer y a aprender más de lo que ya sabía.",
                    "subtitle": "Soy Vicky O’Shee de Argentina, trabajo como emprendedora digital ahora radicada en Medellín, Colombia...",
                    "image_url": "https://static.platzi.com/static/stories/images/victoria-card.98c35c8ac6af.jpg",
                    
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://platzi.com/historias/me-ayudo-a-crecer-y-a-aprender-mas-de-lo-que-ya-sabia/",
                        "title": "Leer más (+)"
                    }, {
                        "type": "web_url",
                        "url": "platzi.com/historias",
                        "title": "Ver más Historias..."
                    }],
                }]
            }
      }
    }
  };  

  callSendAPI(messageData);
}

// Envio mensajes en el Messenger
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