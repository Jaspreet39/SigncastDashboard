import { useEffect, useState } from "react";
import * as fabric from "fabric";
import io from "socket.io-client";
import { QRCodeCanvas } from "qrcode.react";
import { Upload, Clock, Cloud, Type } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto p-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Digital Signage Studio</h1>
          <p className="text-gray-600">Create and manage your digital displays</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Widget Sidebar */}
          <div className="w-full lg:w-64 bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Widgets</h3>
            <div className="space-y-3">
              <button
                onClick={addText}
                className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Type className="w-4 h-4" />
                <span>Add Text</span>
              </button>

              <label className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={addImage}
                  className="hidden"
                />
              </label>

              <button
                onClick={addClock}
                className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>Add Clock</span>
              </button>

              <button
                onClick={addWeatherWidget}
                className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Cloud className="w-4 h-4" />
                <span>Add Weather</span>
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="w-full overflow-auto">
                <canvas id="canvas" className="border border-gray-200 rounded-lg"></canvas>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={syncContent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sync Content ({status})
                </button>
              </div>
            </div>

            {pairingCode && (
              <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pairing Code</h2>
                <div className="flex justify-center">
                  <QRCodeCanvas value={pairingCode} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
