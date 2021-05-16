import { useEffect, useRef } from 'react';
import Particles from "../webgl/Particles";
import "./particles.css";

function ParticlesComponent() {

  const particlesRef = useRef(null); 

  useEffect(() => {
    new Particles(particlesRef); 
  }, []);
    
  return (
    <div class="particles-wrapper">
      <div class="particles" ref={particlesRef}></div>
    </div>
    
  )
}

export default ParticlesComponent;