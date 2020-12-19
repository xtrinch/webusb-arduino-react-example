# webusb-arduino-react-example

This repository is the react/platformio version of the demo you can find at https://github.com/webusb/arduino repository.

Contains two parts: sketch code (for platformio) and website code, demonstrating the use of webusb on arduino.

Sketch should be uploaded to one of the listed dev boards (see `Serial.ts`), if you add your own it should have a native USB interface.

React app is run with `yarn start`, spawns it at localhost:3000.

No need to modify any USB defines for platformio as it is necessary for the Arduino IDE.

End result is you being able to toggle three leds connected to the arduino: red, green and blue. You can toggle them via the website, provided you have actually put the LED's at the pins specified inside the sketch - 9, 10, 11.
