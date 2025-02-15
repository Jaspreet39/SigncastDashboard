import { useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const SyncButton = () => {
  const [status, setStatus] = useState("Not Synced");

  const syncContent = () => {
    socket.emit("sync", { content: "Sample Data" });
    setStatus("Synced!");
  };

  return (
    <button className="p-2 bg-blue-500 text-white" onClick={syncContent}>
      Sync Content ({status})
    </button>
  );
};

export default SyncButton;
