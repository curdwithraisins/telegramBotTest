const fp = require('lodash/fp');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const { isHi, isCheck, getCity } = require('./helpers');

const URLs = require('./configs').URLs;

require('dotenv').config();

const telegramURL = URLs.bot + process.env.TELEGRAM_API_TOKEN + "/sendMessage";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

class HandleMessage {
    constructor() {
        this.successor = null;
    }

    setSuccessor(successor) {
        this.successor = successor;
    }

    callSuccessor(text) {
        if (this.successor) {
            this.successor.parseMessage(text);
        }
    }

    parseMessage() {}
}

class HandleHi extends HandleMessage {
    parseMessage(text) {
        if (isHi(text)) {
            const reply = "Welcome to telegram weather bot";
            sendMessage(telegramURL, text, reply, res);
        } else {
            this.callSuccessor(text);
        }
    }
}

class HandleCity extends HandleMessage {
    parseMessage(text) {
        const city = getCity(text);
        if ((isCheck(text)) && (city)) {
            get_forecast(city).then(response =>{
                post_forecast(telegramURL, response, message, res)
            });
        } else {
            this.callSuccessor(text);
        }
    }
}

class HandleError extends HandleMessage {
    parseMessage(text) {
        const reply = "Request not understood, please review and try again.";
        sendMessage(telegramURL,message,reply,res);
        return res.end();
    }
}

function sendMessage(url, message, reply, res) {
    axios.post(url, { 
        chat_id: message.chat.id,
        text: reply
    }).then(response => {
        console.log("Message posted");
        res.end("ok");
    }).catch(error =>{
        console.log(error);
    });
}

function get_forecast(city){
    let new_url = `${openWeatherUrl}${city}&appid=${process.env.OPENWEATHER_API_KEY}`;
    return axios.get(new_url).then(response => {
        let temp = response.data.main.temp;
        //converts temperature from kelvin to celsuis
        temp = Math.round(temp - 273.15); 
        let city_name = response.data.name;
        let resp = `It's ${temp} degrees in ${city_name}`;
        return resp;
    }).catch(error => {
        console.log(error);
    });
}

debugger;

const handleHi = new HandleHi();
const handleCity = new HandleCity();
const handleError = new HandleError();

handleHi.setSuccessor(handleCity);
handleCity.setSuccessor(handleError);

app.post('/start_bot', (req, res) => {
    const { message } = req.body;
    const text = fp.lowerCase(message.text);

    const output = handleHi.parseMessage(text);

    if (output) {
        return output;
    } 
});

app.listen(5555, () => console.log("Telegram bot is listening on port 5555!"));