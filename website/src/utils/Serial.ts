
const filters: USBDeviceFilter[] = [
  { 'vendorId': 0x2341, 'productId': 0x8036 }, // Arduino Leonardo
  { 'vendorId': 0x2341, 'productId': 0x8037 }, // Arduino Micro
  { 'vendorId': 0x2341, 'productId': 0x804d }, // Arduino/Genuino Zero
  { 'vendorId': 0x2341, 'productId': 0x804e }, // Arduino/Genuino MKR1000
  { 'vendorId': 0x2341, 'productId': 0x804f }, // Arduino MKRZERO
  { 'vendorId': 0x2341, 'productId': 0x8050 }, // Arduino MKR FOX 1200
  { 'vendorId': 0x2341, 'productId': 0x8052 }, // Arduino MKR GSM 1400
  { 'vendorId': 0x2341, 'productId': 0x8053 }, // Arduino MKR WAN 1300
  { 'vendorId': 0x2341, 'productId': 0x8054 }, // Arduino MKR WiFi 1010
  { 'vendorId': 0x2341, 'productId': 0x8055 }, // Arduino MKR NB 1500
  { 'vendorId': 0x2341, 'productId': 0x8056 }, // Arduino MKR Vidor 4000
  { 'vendorId': 0x2341, 'productId': 0x8057 }, // Arduino NANO 33 IoT
  { 'vendorId': 0x239A }, // Adafruit Boards!
];

export class Serial {
  public static async getPorts(): Promise<Port[]> {
    const devices = await navigator.usb.getDevices();
    return devices.map(device => new Port(device));
  };

  public static async requestPort() {
    const device = await navigator.usb.requestDevice({ filters });
    return new Port(device);
  }
}

export class Port {
  public device_: USBDevice;
  public interfaceNumber_: number;
  public endpointIn_: number;
  public endpointOut_: number;

  constructor(device: USBDevice) {
    this.device_ = device;
    this.interfaceNumber_ = 2;  // original interface number of WebUSB Arduino demo
    this.endpointIn_ = 5;       // original in endpoint ID of WebUSB Arduino demo
    this.endpointOut_ = 4;      // original out endpoint ID of WebUSB Arduino demo
  }
  
  public async send(data: BufferSource) {
    const result = await this.device_.transferOut(this.endpointOut_, data);
    await this.readLoop();
    return result;
  };

  public async disconnect() {
    await this.device_.controlTransferOut({
      requestType: 'class',
      recipient: 'interface',
      request: 0x22,
      value: 0x00,
      index: this.interfaceNumber_
    });
    this.device_.close();
  };
  
  public onReceive = (data: DataView | undefined) => {
    let textDecoder = new TextDecoder();
    console.log(textDecoder.decode(data));
  }

  public async readLoop() {
    try {
      const result = await this.device_.transferIn(this.endpointIn_, 64);
      this.onReceive(result.data);
    } catch(e) {
      console.log(e);
      return;
    }
  };

  public async connect() {
    await this.device_.open();

    if (this.device_.configuration === null) {
      this.device_.selectConfiguration(1);
    }

    let configurationInterfaces = this.device_.configuration?.interfaces || [];
    configurationInterfaces.forEach(element => {
      element.alternates.forEach(elementalt => {
        if (elementalt.interfaceClass !== 0xff) {
          return;
        }

        this.interfaceNumber_ = element.interfaceNumber;
        elementalt.endpoints.forEach((elementendpoint) => {
          if (elementendpoint.direction === "out") {
            this.endpointOut_ = elementendpoint.endpointNumber;
          }
          if (elementendpoint.direction === "in") {
            this.endpointIn_ =elementendpoint.endpointNumber;
          }
        })
      })
    })

    await this.device_.claimInterface(this.interfaceNumber_);
    await this.device_.selectAlternateInterface(this.interfaceNumber_, 0);
    await this.device_.controlTransferOut({
      requestType: 'class',
      recipient: 'interface',
      request: 0x22,
      value: 0x01,
      index: this.interfaceNumber_
    });
  };
}