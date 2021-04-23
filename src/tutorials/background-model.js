import { useEffect, useRef } from 'react';
import Tachi from '../webgl/Tachi';
import "./tachi.css";

function BackgroundComponent() {

  const tachiRef = useRef(null); 

  useEffect(() => {
    new Tachi(tachiRef); 
  }, []);
    
  return (
    <div class="wrapper">
      <div class="tachi-information">
        <div>Martian Name : Tachi</div>
        <div>Holden Name : Rocinante</div>
        <div>Crew members : Alex, Naomi, Amos, Holden</div>
        <div>Weapons : PDC, torpedos, raygun</div>
      </div>
      <div id="avatar" ref={tachiRef}></div>
    </div>
  )
}

export default BackgroundComponent;