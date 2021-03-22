import { useEffect, useRef } from 'react';
import './App.css';
import BasicWorldDemo from './tutorials/simple3d-world';

function App() {

  const threeRef = useRef(null);

  useEffect(() => {
    // const demo = new SimpleCubeDemo(threeRef);
    const demo = new BasicWorldDemo(threeRef);
    demo.start();
  })

  return (
    <div ref={threeRef}></div>
  );
}

export default App;
