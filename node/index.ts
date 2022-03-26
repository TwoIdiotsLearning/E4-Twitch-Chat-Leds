import { Client as IRCClient } from "irc";
import colorMapping from "./colorMapping";
import { SerialPort } from 'serialport'
import { ReadlineParser } from "@serialport/parser-readline"

const serialPort = "COM6"
const username = process.env.TWITCH_CHAT_USERNAME;
const password = process.env.TWITCH_CHAT_PASSWORD;

const serialport = new SerialPort({ path: serialPort, baudRate: 9600 });
const parser = serialport.pipe(new ReadlineParser({ delimiter: '\r\n' }))
parser.on("data", (data) => {
	console.log(`data from arduino: ${data.toString()}`)
})

const irc = new IRCClient("irc.chat.twitch.tv", username, {
	password,
	channels: [`#${username}`]
});

const writeToChat = (msg: string) => {
	irc.say(`#${username}`, msg);
	console.log(`writing to chat: "${msg}"`);
}

irc.addListener("message", (from: string, channel: string, message: string) => {
	if ("streamelements" === from && message.startsWith("doLights")) {
		const [, leds, color] = message.match(/^doLights\s?(\d)\s(.*?)\s?$/) ?? [];
		if (!leds || !color) {
			console.error("no leds or color found")
			return;
		}
		if (!colorMapping[leds]) {
			writeToChat(`No such led strip ${leds}`);
			return;
		}
		if (!colorMapping[leds][color]) {
			writeToChat(`No such color "${color}" on strip ${leds}`);
			return;
		}
		const [address = null, command = null] = colorMapping[leds]?.[color];
		if (null === address || null === command) {
			writeToChat(`No such color "${color}" on strip ${leds}`);
			return;
		}
		const cmdBuffer = Buffer.alloc(3);
		cmdBuffer.writeUInt16LE(address);
		cmdBuffer.writeUInt8(command, 2);
		serialport.write(cmdBuffer);
	}
});
irc.addListener("error", (...args) => { });

