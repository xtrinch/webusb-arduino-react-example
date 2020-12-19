import React, { useEffect, useState } from 'react';
import './App.css';
import { Port, Serial } from './utils/Serial';

const App: React.FunctionComponent<any> = () => {
  const [r, setR] = useState(0);
  const [g, setG] = useState(0);
  const [b, setB] = useState(0);
  const [port, setPort] = useState<Port | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const connect = async (pIn: Port | null) => {
    let p = pIn;
    if (!p) {
      p = await Serial.requestPort();
      setPort(p);
    }
    // if we still don't have port defined
    if (!p) {
      return;
    }
    try {
      await p.connect();
    } catch(e) {
      console.log(e);
      setErrorMessage(JSON.stringify(e));
    }
  }

  const disconnect = async () => {
    if (!port) {
      return;
    }

    await port.disconnect();
    setPort(null);
  }

  const send = async () => {
    if (!port) {
      return;
    }
    
    let view = new Uint8Array([r, g, b]).buffer;
    await port.send(view);
    await port.readLoop();
  }
  
  useEffect(() => {
    const checkIfAlreadyConnected = async () => {
      const devices = await Serial.getPorts();
      if (devices.length > 0) {
        setPort(devices[0]);
        await connect(devices[0]);
      }
    }

    checkIfAlreadyConnected();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  useEffect(() => {
    send();
  }, [r, g, b]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="App">
      <p>
        {port ? (
            <button onClick={disconnect}>Disconnect</button>
          ) : (
            <button onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => connect(port)}>Connect</button>
        )}
      </p>
      <p>
        {errorMessage}
      </p>
      <div>
        <input disabled={!port} type="range" min="0" max="255" value={r} onChange={(e) => setR(parseInt(e.target.value))} id="red"/>
        <input disabled={!port} type="range" min="0" max="255" value={g} onChange={(e) => setG(parseInt(e.target.value))} id="green"/>
        <input disabled={!port} type="range" min="0" max="255" value={b} onChange={(e) => setB(parseInt(e.target.value))} id="blue"/>
      </div>
    </div>
  );
}

export default App;
