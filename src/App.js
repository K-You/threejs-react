import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Link, Route, Switch, useParams } from 'react-router-dom';
import './App.css';
import SpaceWorld from './space/space-world';
import BackgroundComponent from './tutorials/background-model';
import BlankCanvasComponent from './tutorials/blank-canvas';
import CharacterMovement from './tutorials/character-movement';
import ParticlesComponent from './tutorials/particles';
import SimpleCubeDemo from './tutorials/simple-cube';
import BasicWorldDemo from './tutorials/simple3d-world';
import Warehouse from './tutorials/warehouse';

function App() {
  
  return (
    <Router>
      <nav class="route-nav">
        <ul>
          <li>
            <Link to="/simple3d-cube">Simple cube</Link>
          </li>
          <li>
            <Link to="/simple3d-world">Simple world</Link>
          </li>
          <li>
            <Link to="/character-movement">Dancing character</Link>
          </li>
          <li>
            <Link to="/space-world">Space battle</Link>
          </li>
          <li>
            <Link to="/background">Tachi Bg</Link>
          </li>
          <li>
            <Link to="/warehouse">Warehouse</Link>
          </li>
          <li>
            <Link to="/canvas">Canvas</Link>
          </li>
          <li>
            <Link to="/particles">Particles</Link>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/background" children={<BackgroundComponent/>} />
        <Route path="/canvas" children={<BlankCanvasComponent/>} />
        <Route path="/particles" children={<ParticlesComponent/>} />
        <Route path="/:path" children={<ThreeComponent/>} />
      </Switch>
    </Router>
  );
}

function ThreeComponent() {
  let { path } = useParams();

  const threeRef = useRef(null); 
  const demo = useRef(null);  

  useEffect(() => {
    if (demo.current !== null) {
      demo.current.clear();
    }
    if(threeRef != null){
      threeRef.current.innerHTML = '';
    }
    switch(path){
      case 'simple3d-world':
        demo.current =(new BasicWorldDemo(threeRef));
        break;
      case 'warehouse':
        demo.current =(new Warehouse(threeRef));
        break;
      case 'character-movement':
        demo.current = (new CharacterMovement(threeRef));
        break;
      case 'space-world':
        demo.current = (new SpaceWorld(threeRef));
        break;
      default: 
      demo.current = (new SimpleCubeDemo(threeRef));
    }
    if (demo.current != null){
      demo.current.start();
    }
  }, [path]);

  return (
    <div ref={threeRef}></div>
  )
}

export default App;
