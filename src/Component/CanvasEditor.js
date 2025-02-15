import { useEffect, useRef } from "react";
import { fabric } from "fabric";

const CanvasEditor = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 450,
      backgroundColor: "#ffffff",
    });

    canvas.add(new fabric.Text("Drag elements here!", { left: 50, top: 50 }));

    return () => canvas.dispose();
  }, []);

  return <canvas ref={canvasRef} />;
};

export default CanvasEditor;
