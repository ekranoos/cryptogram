const TelegramBot = require('node-telegram-bot-api'),
			fetch = require('node-fetch'),
			numbro = require('numbro'),
			map = require('./currencies'),
			Promise = require('bluebird')

require('dotenv').config()

//Fix for https://github.com/yagop/node-telegram-bot-api/issues/319
Promise.config({
	cancellation: true
})

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
	polling: true
})

// Start
bot.onText(/\/start/, (msg) => {
	bot.sendMessage(msg.chat.id, 'Welcome to <b>Cryptogram</b>! Do /help for a list of commands.', {
		parse_mode: "html"
	})
})

// Help
bot.onText(/\/help/, (msg) => {
	bot.sendMessage(msg.chat.id, '<b>Commands:</b>\n<b>/price + CURRENCY</b> (<i>bitcoin, ethereum, ..</i>).\n<b>/source</b>', {
		parse_mode: "html"
	})
})

// Source
bot.onText(/\/source/, (msg) => {
	bot.sendMessage(msg.chat.id, '<a href="' + process.env.GITHUB_REPOSITORY + '">Github repository</a>', {
		parse_mode: "html"
	})
})

// Price
bot.onText(/\/price/, (msg) => {

	// Check if a currency has been added
	if (msg.text.split(' ').length < 2) {
		bot.sendMessage(msg.chat.id, 'You actually have to add a currency.')
		return
	}

	const resp = msg.text.split(' ')[1].toLowerCase()

	// Check if valid currency
	if (map[resp]) {
		currency = map[resp]
		fetch('https://api.coinmarketcap.com/v1/ticker/' + currency + '/?convert=EUR&USD')
			.then(response => {
				response.json().then(json => {

					var message = [
						`<b>‼ Name: </b><a href="https://coinmarketcap.com/currencies/${currency}/">${json[0]['name']}</a>`,
						`<b>⭐ Rank: </b>${json[0]['rank']}`,
						`<b>⏰ Last 24h: </b>${numbro(json[0]['percent_change_24h']).format('0.00')}%`,
						`<b>⏳ Last 7d: </b>${numbro(json[0]['percent_change_7d']).format('0.00')}%`,
						`<b>💶 EUR: </b>${numbro(json[0]['price_eur']).format('0,0.00')} EUR`,
						`<b>💵 USD: </b>${numbro(json[0]['price_usd']).format('0,0.00')} USD`,
						`<b>🔸 Market Cap: </b>${numbro(json[0]['market_cap_usd']).format('0,0.00')} USD`,
						`<b>💹 24h Volume: </b>${numbro(json[0]['24h_volume_usd']).format('0,0.00')} USD`
					]

					bot.sendMessage(msg.chat.id, message.join("\n"), {
						parse_mode: "html",
						disable_web_page_preview: true
					})
					
				})
			})
	} else {
		bot.sendMessage(msg.chat.id, 'Currency not supported.')
	}
})

console.log("Cryptogram is running!")
