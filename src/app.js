require('dotenv').config();

const token = process.env.TELEGRAM_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token, {
	polling: true
});
const fetch = require("node-fetch");

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
	bot.sendMessage(msg.chat.id, 'use <b>/available</b> to get a list of all supported currencies.', {
		parse_mode: "html",
		disable_web_page_preview: true
	});
});

// Source
bot.onText(/\/source/, (msg) => {
	bot.sendMessage(msg.chat.id, '<a href="' + repo + '">Github repository</a>', {
		parse_mode: "html"
	});
});

// Check if a currency has been added to the /price command
bot.onText(/\price/, (msg) => {
	async function issetCurrency(msg) {
		var data = await bot.getMe({});
		if (msg.text == '/price' || msg.text == '/price@' + data.username) {
			bot.sendMessage(msg.chat.id, 'You actually have to add a currency.');
		}
	}

	issetCurrency(msg);
});

// Price
bot.onText(/\/price (.+)/, (msg, match) => {
	const resp = match[1].toLowerCase();
	var map = require('./currencies');

	if (map[resp]) {
		currency = map[resp];
		fetch('https://api.coinmarketcap.com/v1/ticker/' + currency + '/?convert=EUR&USD')
		.then(response => {
			response.json().then(json => {
				var name = '<b>‼ Name: </b>' + '<a href="https://coinmarketcap.com/currencies/' + currency + '">' + `${json[0].name}` + '</a>' + '\n';
				var rank = '<b>⭐ Rank: </b>' + `${json[0].rank}` + '\n';
				var last24h = '<b>⏰ Last 24h: </b>' + `${json[0].percent_change_24h}` + ' %' + '\n';
				var last7d = '<b>⏳ Last 7d: </b>' + `${json[0].percent_change_7d}` + ' %' + '\n';

				var euro = `${json[0].price_eur}`;
				euro = parseFloat(euro).toFixed(2).replace('.', ',');
				switch (euro.toString().split(",")[0].length) {
					case 4:
					euro = euro.replace(/(\d{1})(\d*)/, '$1.$2');
					break;
					case 5:
					euro = euro.replace(/(\d{2})(\d*)/, '$1.$2');
					break;
					case 6:
					euro = euro.replace(/(\d{3})(\d*)/, '$1.$2');
					break;
					case 7:
					euro = euro.replace(/(\d{4})(\d*)/, '$1.$2');
					break;
				}
				var eur = '<b>💶 EUR: </b>' + euro + ' €' + '\n';

				var dollar = `${json[0].price_usd}`;
				dollar = parseFloat(dollar).toFixed(2).replace('.', ',');
				switch (dollar.toString().split(",")[0].length) {
					case 4:
					dollar = dollar.replace(/(\d{1})(\d*)/, '$1.$2');
					break;
					case 5:
					dollar = dollar.replace(/(\d{2})(\d*)/, '$1.$2');
					break;
					case 6:
					dollar = dollar.replace(/(\d{3})(\d*)/, '$1.$2');
					break;
					case 7:
					dollar = dollar.replace(/(\d{4})(\d*)/, '$1.$2');
					break;
				}
				var usd = '<b>💵 USD: </b>' + dollar + ' $' + '\n';
				bot.sendMessage(msg.chat.id, name + rank + last24h + last7d + eur + usd, {
					parse_mode: "html",
					disable_web_page_preview: true
				});
			});
		})
	}
});