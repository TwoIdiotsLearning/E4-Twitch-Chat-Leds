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
	IrSender.begin(IR_SEND_PIN, ENABLE_LED_FEEDBACK);
	IrSender.enableIROut(38);
}

void loop()
{
	Request data = {0};
	Serial.readBytes((char *)&data, sizeof(Request));
	Serial.print("Sending address=");
	Serial.print(data.address);
	Serial.print(" command=");
	Serial.println(data.command);
	IrSender.sendNEC(data.address, data.command, 0);
}
