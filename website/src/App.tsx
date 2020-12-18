import React, { useEffect, useState } from 'react';
import './App.css';
import { Port, Serial } from './utils/Serial';

const App: React.FunctionComponent<any> = () => {
  const [r, setR] = useState(0);
  const [g, setG] = useState(0);
  const [b, setB] = useState(0);
  const [port, setPort] = useState<Port | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const connect = async () => {
    const p = await Serial.requestPort();
    console.log(p);
    setPort(p);
    try {
      await p.connect();
    } catch(e) {
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
  
  useEffect(() => {
    if (!port) {
      return;
    }

    let view = new Uint8Array([r, g, b]).buffer;
    console.log(view)
    port.send(view);
  }, [r, g, b]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="App">
      <p>
        {port ? (
            <button onClick={disconnect}>Disconnect</button>
          ) : (
            <button onClick={connect}>Connect</button>
        )}
      </p>
      <p>
        {errorMessage}
      </p>
      <div>
        <input type="range" min="0" max="255" value={r} onChange={(e) => setR(parseInt(e.target.value))} id="red"/>
        <input type="range" min="0" max="255" value={g} onChange={(e) => setG(parseInt(e.target.value))} id="green"/>
        <input type="range" min="0" max="255" value={b} onChange={(e) => setB(parseInt(e.target.value))} id="blue"/>
      </div>
    </div>
  );
}

export default App;
