require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
	polling: true
});
const fetch = require("node-fetch");
var numbro = require("numbro");

// Start
bot.onText(/\/start/, (msg) => {
	bot.sendMessage(msg.chat.id, 'Thanks for using me.', {
		parse_mode: "html"
	});
});

// Help
bot.onText(/\/help/, (msg) => {
	bot.sendMessage(msg.chat.id, '<b>/price + CURRENCY</b> (<i>bitcoin, ethereum, ..</i>).', {
		parse_mode: "html"
	});
});

// Source
bot.onText(/\/source/, (msg) => {
	bot.sendMessage(msg.chat.id, '<a href="' + process.env.GITHUB_REPOSITORY + '">Github repository</a>', {
		parse_mode: "html"
	});
});

// Price
bot.onText(/\/price/, (msg) => {

	// Check if a currency has been added
	if (msg.text.split(' ').length < 2) {
		bot.sendMessage(msg.chat.id, 'You actually have to add a currency.');
		return;
	}

	const resp = msg.text.split(' ')[1].toLowerCase();
	var map = require('./currencies');

	if (map[resp]) {
		currency = map[resp];
		fetch('https://api.coinmarketcap.com/v1/ticker/' + currency + '/?convert=EUR&USD')
			.then(response => {
				response.json().then(json => {
					var name = `<b>‼ Name: </b><a href="https://coinmarketcap.com/currencies/${currency}/">${json[0]['name']}</a>\n`;
					var rank = `<b>⭐ Rank: </b>${json[0]['rank']}\n`;
					var last24h = `<b>⏰ Last 24h: </b>${numbro(json[0]['percent_change_24h']).format('0.00')} %\n`;
					var last7d = `<b>⏳ Last 7d: </b>${numbro(json[0]['percent_change_7d']).format('0.00')} %\n`;
					var eur = `<b>💶 EUR: </b>${numbro(json[0]['price_eur']).format('0,0.00')} €\n`;
					var usd = `<b>💵 USD: </b>${numbro(json[0]['price_usd']).format('0,0.00')} $\n`;
					var marketCap = `<b>🔸 Market Cap: </b>${numbro(json[0]['market_cap_usd']).format('0,0.00')} $\n`;
					var volume24h = `<b>💹 24h Volume: </b>${numbro(json[0]['24h_volume_usd']).format('0,0.00')} $\n`;

					bot.sendMessage(msg.chat.id, name + rank + last24h + last7d + eur + usd + volume24h + marketCap, {
						parse_mode: "html",
						disable_web_page_preview: true
					});
				});
			})
	} else {
		bot.sendMessage(msg.chat.id, 'Currency not supported.');
	}
});