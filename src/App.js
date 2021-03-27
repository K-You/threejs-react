import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Link, Route, Switch, useParams } from 'react-router-dom';
import './App.css';
import SpaceWorld from './space/space-world';
import CharacterMovement from './tutorials/character-movement';
import SimpleCubeDemo from './tutorials/simple-cube';
import BasicWorldDemo from './tutorials/simple3d-world';

function App() {
  return (
    <Router>
      <div>
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
        </ul>
        <hr />
        <Switch>
          <Route path="/:path" children={<ThreeComponent/>} />
        </Switch>
      </div>
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
