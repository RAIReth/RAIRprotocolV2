import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const TariffGameReact: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
        <Sphere args={[0.2, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial color="blue" />
        </Sphere>
      </Canvas>
      <div style={{ position: 'absolute', top: 20, left: 20, background: 'white', padding: 20 }}>
        <button onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={() => setSimulationSpeed(prev => prev * 2)}>
          Speed: {simulationSpeed}x
        </button>
      </div>
    </div>
  );
};

export default TariffGameReact; 