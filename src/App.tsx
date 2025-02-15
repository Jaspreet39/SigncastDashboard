import { useEffect, useState } from "react";
import * as fabric from "fabric";
import io from "socket.io-client";
import { QRCodeCanvas } from "qrcode.react";

const socket = io("http://localhost:5000");

const App = () => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [status, setStatus] = useState("Not Synced");
  // const [pairingCode, setPairingCode] = useState<string | null>(null); // Keep it if you plan to use it.
  const pairingCode = null



  useEffect(() => {
    const newCanvas = new fabric.Canvas("canvas", {
      width: 800,
      height: 450,
      backgroundColor: "#ffffff",
    });
    setCanvas(newCanvas);

    fetch("http://localhost:5000/content")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) {
          newCanvas.loadFromJSON(
            JSON.parse(data.data),
            newCanvas.renderAll.bind(newCanvas)
          );
        }
      });

    socket.on("updateContent", (data) => {
      newCanvas.loadFromJSON(
        JSON.parse(data.data),
        newCanvas.renderAll.bind(newCanvas)
      );
    });

    return () => {
      newCanvas.dispose();
    };
  }, []);

  const syncContent = () => {
    if (!canvas) return; // Ensure canvas exists
    const content = JSON.stringify(canvas.toJSON());
    fetch("http://localhost:5000/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: content }),
    });
    setStatus("Synced!");
  };

  const addText = () => {
    if (!canvas) return;
    const text = new fabric.Text("Custom Header", {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: "black",
    });
    canvas.add(text);
  };


  const addImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = function (e: ProgressEvent<FileReader>) {
      if (!e.target?.result) return; // Ensure the result exists

      const imgElement = document.createElement("img");
      imgElement.src = e.target.result as string; // ✅ This is the correct placement

      imgElement.onload = () => {
        if (!canvas) return;
        const imgInstance = new fabric.Image(imgElement, {
          left: 150,
          top: 150,
          scaleX: 0.5,
          scaleY: 0.5,
        });
        canvas.add(imgInstance);
        canvas.renderAll();
      };
    };

    reader.readAsDataURL(file);
  };


  const addClock = () => {
    if (!canvas) return;
    const clockText = new fabric.Text(new Date().toLocaleTimeString(), {
      left: 200,
      top: 200,
      fontSize: 20,
      fill: "blue",
    });
    canvas.add(clockText);
    setInterval(() => {
      clockText.set("text", new Date().toLocaleTimeString());
      canvas.renderAll();
    }, 1000);
  };


  const addWeatherWidget = () => {
    if (!canvas) return
    const weatherText = new fabric.Text("Weather: 25°C Sunny", {
      left: 300,
      top: 50,
      fontSize: 18,
      fill: "green",
    });
    canvas.add(weatherText);
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Widget Sidebar */}
      <div
        style={{
          width: "200px",
          padding: "10px",
          borderRight: "1px solid #ccc",
        }}
      >
        <h3>Widgets</h3>
        <button onClick={addText}>Add Text</button>
        <input type="file" accept="image/*" onChange={addImage} />
        <button onClick={addClock}>Add Clock</button>
        <button onClick={addWeatherWidget}>Add Weather</button>
      </div>
      {/* Canvas Area */}
      <div>
        <h1>Digital Signage Studio</h1>
        <canvas id="canvas"></canvas>
        <button onClick={syncContent}>Sync Content ({status})</button>
        <h2>Pairing Code</h2>
        {pairingCode && <QRCodeCanvas value={pairingCode} />}
      </div>
    </div>
  );
};

export default App;
