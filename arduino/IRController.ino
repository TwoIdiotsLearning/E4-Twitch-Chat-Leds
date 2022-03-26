#include <IRremote.h>

#define IR_SEND_PIN 3

struct Request
{
	uint16_t address;
	uint8_t command;
};

void setup()
{
	Serial.begin(9600);
	Serial.setTimeout(2000000);
	IrSender.begin(IR_SEND_PIN, ENABLE_LED_FEEDBACK); // Start with IR_SEND_PIN as send pin and enable feedback LED at default feedback LED pin
	IrSender.enableIROut(38);						  // Call it with 38 kHz to initialize the values printed below
}

void loop()
{
	Request data = {0};
	Serial.readBytes((char*)&data, sizeof(Request));
	Serial.print("Sending address=");
	Serial.print(data.address);
	Serial.print(" command=");
	Serial.println(data.command);
	IrSender.sendNEC(data.address, data.command, 0);
}
