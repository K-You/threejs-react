import { useEffect, useRef } from 'react';
import BlankCanvas from "../webgl/BlankCanvas";
import "./canvas.css";

function BlankCanvasComponent() {

  const canvasRef = useRef(null); 

  useEffect(() => {
    new BlankCanvas(canvasRef); 
  }, []);
    
  return (
    <div class="canvas-wrapper">
      <div class="canvas" ref={canvasRef}></div>
    </div>
    
  )
}

export default BlankCanvasComponent;