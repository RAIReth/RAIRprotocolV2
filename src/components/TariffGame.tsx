import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import ParameterControls from './ParameterControls';
import TariffGlobe from './TariffGlobe';

interface Country {
  id: string;
  name: string;
  gdp: number;
  previousGdp: number; // Track previous GDP for comparison
  gdpChange: number; // Store the change in GDP for visualization
  population: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  tradePartners: TradePartner[];
}

interface TradePartner {
  countryId: string;
  importVolume: number;
  exportVolume: number;
  tariffRate: number;
}

interface GameState {
  isRunning: boolean;
  currentTime: number;
  countries: Country[];
  globalParameters: GlobalParameters;
}

interface GlobalParameters {
  baseTariffRate: number;
  gdpGrowthRate: number;
  tradeMultiplier: number;
  laborProductivity: number; // New parameter
  taxRate: number; // New parameter
}

export default function TariffGame() {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [globalParameters, setGlobalParameters] = useState<GlobalParameters>({
    baseTariffRate: 5,
    gdpGrowthRate: 2,
    tradeMultiplier: 1,
    laborProductivity: 1, // Initial value
    taxRate: 15 // Initial value
  });
  const [countries, setCountries] = useState<Country[]>([
    {
      id: 'us',
      name: 'United States',
      gdp: 21000,
      previousGdp: 21000,
      gdpChange: 0,
      population: 331,
      coordinates: { lat: 37.0902, lng: -95.7129 },
      tradePartners: [
        { countryId: 'cn', importVolume: 500, exportVolume: 120, tariffRate: 5 },
        { countryId: 'mx', importVolume: 350, exportVolume: 250, tariffRate: 3 },
        { countryId: 'ca', importVolume: 300, exportVolume: 280, tariffRate: 2 },
        { countryId: 'jp', importVolume: 150, exportVolume: 80, tariffRate: 3 }
      ]
    },
    {
      id: 'cn',
      name: 'China',
      gdp: 14700,
      previousGdp: 14700,
      gdpChange: 0,
      population: 1402,
      coordinates: { lat: 35.8617, lng: 104.1954 },
      tradePartners: [
        { countryId: 'us', importVolume: 120, exportVolume: 500, tariffRate: 5 },
        { countryId: 'jp', importVolume: 200, exportVolume: 150, tariffRate: 4 },
        { countryId: 'kr', importVolume: 180, exportVolume: 120, tariffRate: 3 },
        { countryId: 'de', importVolume: 100, exportVolume: 80, tariffRate: 4 }
      ]
    },
    {
      id: 'mx',
      name: 'Mexico',
      gdp: 1200,
      previousGdp: 1200,
      gdpChange: 0,
      population: 128,
      coordinates: { lat: 23.6345, lng: -102.5528 },
      tradePartners: [
        { countryId: 'us', importVolume: 250, exportVolume: 350, tariffRate: 3 },
        { countryId: 'ca', importVolume: 50, exportVolume: 30, tariffRate: 2 },
        { countryId: 'br', importVolume: 20, exportVolume: 15, tariffRate: 4 }
      ]
    },
    {
      id: 'jp',
      name: 'Japan',
      gdp: 4230,
      previousGdp: 4230,
      gdpChange: 0,
      population: 125,
      coordinates: { lat: 36.2048, lng: 138.2529 },
      tradePartners: [
        { countryId: 'us', importVolume: 80, exportVolume: 150, tariffRate: 3 },
        { countryId: 'cn', importVolume: 150, exportVolume: 200, tariffRate: 4 },
        { countryId: 'kr', importVolume: 70, exportVolume: 50, tariffRate: 3 },
        { countryId: 'au', importVolume: 40, exportVolume: 30, tariffRate: 2 }
      ]
    },
    {
      id: 'de',
      name: 'Germany',
      gdp: 4220,
      previousGdp: 4220,
      gdpChange: 0,
      population: 83,
      coordinates: { lat: 51.1657, lng: 10.4515 },
      tradePartners: [
        { countryId: 'us', importVolume: 120, exportVolume: 100, tariffRate: 3 },
        { countryId: 'cn', importVolume: 80, exportVolume: 100, tariffRate: 4 },
        { countryId: 'fr', importVolume: 150, exportVolume: 140, tariffRate: 2 },
        { countryId: 'it', importVolume: 100, exportVolume: 90, tariffRate: 2 }
      ]
    },
    {
      id: 'uk',
      name: 'United Kingdom',
      gdp: 3180,
      previousGdp: 3180,
      gdpChange: 0,
      population: 67,
      coordinates: { lat: 55.3781, lng: -3.4360 },
      tradePartners: [
        { countryId: 'us', importVolume: 100, exportVolume: 90, tariffRate: 3 },
        { countryId: 'de', importVolume: 120, exportVolume: 80, tariffRate: 2 },
        { countryId: 'fr', importVolume: 80, exportVolume: 70, tariffRate: 2 },
        { countryId: 'cn', importVolume: 60, exportVolume: 40, tariffRate: 4 }
      ]
    },
    {
      id: 'fr',
      name: 'France',
      gdp: 2930,
      previousGdp: 2930,
      gdpChange: 0,
      population: 67,
      coordinates: { lat: 46.2276, lng: 2.2137 },
      tradePartners: [
        { countryId: 'de', importVolume: 140, exportVolume: 150, tariffRate: 2 },
        { countryId: 'us', importVolume: 80, exportVolume: 70, tariffRate: 3 },
        { countryId: 'it', importVolume: 90, exportVolume: 80, tariffRate: 2 },
        { countryId: 'uk', importVolume: 70, exportVolume: 80, tariffRate: 2 }
      ]
    },
    {
      id: 'it',
      name: 'Italy',
      gdp: 2010,
      previousGdp: 2010,
      gdpChange: 0,
      population: 60,
      coordinates: { lat: 41.8719, lng: 12.5674 },
      tradePartners: [
        { countryId: 'de', importVolume: 90, exportVolume: 100, tariffRate: 2 },
        { countryId: 'fr', importVolume: 80, exportVolume: 90, tariffRate: 2 },
        { countryId: 'us', importVolume: 50, exportVolume: 40, tariffRate: 3 },
        { countryId: 'ch', importVolume: 40, exportVolume: 30, tariffRate: 2 }
      ]
    },
    {
      id: 'br',
      name: 'Brazil',
      gdp: 1830,
      previousGdp: 1830,
      gdpChange: 0,
      population: 212,
      coordinates: { lat: -14.2350, lng: -51.9253 },
      tradePartners: [
        { countryId: 'us', importVolume: 70, exportVolume: 60, tariffRate: 3 },
        { countryId: 'cn', importVolume: 80, exportVolume: 70, tariffRate: 4 },
        { countryId: 'ar', importVolume: 40, exportVolume: 30, tariffRate: 3 },
        { countryId: 'de', importVolume: 30, exportVolume: 25, tariffRate: 3 }
      ]
    },
    {
      id: 'ca',
      name: 'Canada',
      gdp: 2000,
      previousGdp: 2000,
      gdpChange: 0,
      population: 38,
      coordinates: { lat: 56.1304, lng: -106.3468 },
      tradePartners: [
        { countryId: 'us', importVolume: 280, exportVolume: 300, tariffRate: 2 },
        { countryId: 'cn', importVolume: 50, exportVolume: 40, tariffRate: 4 },
        { countryId: 'mx', importVolume: 30, exportVolume: 50, tariffRate: 2 },
        { countryId: 'jp', importVolume: 30, exportVolume: 40, tariffRate: 3 }
      ]
    },
    {
      id: 'kr',
      name: 'South Korea',
      gdp: 1630,
      previousGdp: 1630,
      gdpChange: 0,
      population: 51,
      coordinates: { lat: 35.9078, lng: 127.7669 },
      tradePartners: [
        { countryId: 'cn', importVolume: 120, exportVolume: 180, tariffRate: 3 },
        { countryId: 'us', importVolume: 80, exportVolume: 70, tariffRate: 3 },
        { countryId: 'jp', importVolume: 50, exportVolume: 70, tariffRate: 3 },
        { countryId: 'vn', importVolume: 40, exportVolume: 30, tariffRate: 2 }
      ]
    },
    {
      id: 'in',
      name: 'India',
      gdp: 3170,
      previousGdp: 3170,
      gdpChange: 0,
      population: 1380,
      coordinates: { lat: 20.5937, lng: 78.9629 },
      tradePartners: [
        { countryId: 'us', importVolume: 60, exportVolume: 50, tariffRate: 3 },
        { countryId: 'cn', importVolume: 70, exportVolume: 60, tariffRate: 4 },
        { countryId: 'ae', importVolume: 40, exportVolume: 30, tariffRate: 2 },
        { countryId: 'sa', importVolume: 30, exportVolume: 20, tariffRate: 2 }
      ]
    },
    {
      id: 'ru',
      name: 'Russia',
      gdp: 1770,
      previousGdp: 1770,
      gdpChange: 0,
      population: 144,
      coordinates: { lat: 61.5240, lng: 105.3188 },
      tradePartners: [
        { countryId: 'cn', importVolume: 50, exportVolume: 60, tariffRate: 4 },
        { countryId: 'de', importVolume: 40, exportVolume: 30, tariffRate: 3 },
        { countryId: 'tr', importVolume: 30, exportVolume: 20, tariffRate: 3 },
        { countryId: 'kr', importVolume: 20, exportVolume: 15, tariffRate: 3 }
      ]
    },
    {
      id: 'au',
      name: 'Australia',
      gdp: 1540,
      previousGdp: 1540,
      gdpChange: 0,
      population: 25,
      coordinates: { lat: -25.2744, lng: 133.7751 },
      tradePartners: [
        { countryId: 'cn', importVolume: 60, exportVolume: 80, tariffRate: 4 },
        { countryId: 'jp', importVolume: 30, exportVolume: 40, tariffRate: 3 },
        { countryId: 'us', importVolume: 40, exportVolume: 30, tariffRate: 3 },
        { countryId: 'kr', importVolume: 20, exportVolume: 15, tariffRate: 3 }
      ]
    }
  ]);

  // Handle parameter changes
  const handleParameterChange = (parameter: keyof GlobalParameters, value: number) => {
    setGlobalParameters(prev => ({
      ...prev,
      [parameter]: value
    }));
  };

  // Simulation loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 1);

      // Update countries based on parameters and trade
      setCountries(prevCountries => {
        return prevCountries.map(country => {
          // Store current GDP as previous for next comparison
          const previousGdp = country.gdp;

          // 1. Calculate Trade Balance Effect
          let totalExports = 0;
          let totalImports = 0;
          country.tradePartners.forEach(partner => {
            totalExports += partner.exportVolume;
            totalImports += partner.importVolume;
          });
          const tradeBalance = totalExports - totalImports;
          // Simple scaling for trade balance effect - adjust as needed
          const tradeBalanceEffect = tradeBalance * globalParameters.tradeMultiplier * 0.005; 

          // 2. Calculate Base GDP Growth (Intrinsic)
          const baseGrowthRate = globalParameters.gdpGrowthRate / 100;
          const baseGrowth = country.gdp * baseGrowthRate;
          // Add some randomness, less impactful than before
          const randomFactor = (Math.random() - 0.5) * 0.05; 
          const intrinsicGrowth = baseGrowth * (1 + randomFactor);

          // 3. Calculate Productivity Effect (adds to growth rate)
          const productivityEffect = country.gdp * (globalParameters.laborProductivity / 1000); // Simple bonus based on productivity

          // 4. Calculate Tax Effect (reduces final GDP pool slightly)
          const taxDrag = country.gdp * (globalParameters.taxRate / 2000); // Simple reduction based on tax rate

          // 5. Calculate New GDP
          let newGdp = previousGdp + intrinsicGrowth + tradeBalanceEffect + productivityEffect - taxDrag;
          
          // Ensure GDP doesn't fall below a minimum threshold (e.g., 1 billion)
          newGdp = Math.max(1, newGdp); 
          
          const gdpChange = newGdp - previousGdp;

          return {
            ...country,
            gdp: newGdp,
            previousGdp: previousGdp,
            gdpChange: gdpChange // Store the change
          };
        });
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isRunning, speed, globalParameters]); // Include all globalParameters in dependency array

  return (
    <div className="tariff-game">
      <div className="globe-container">
        <TariffGlobe 
          countries={countries}
          globalParameters={globalParameters}
          isRunning={isRunning}
        />
      </div>
      <div className="controls">
        <button 
          onClick={() => setIsRunning(!isRunning)}
          className="control-button"
        >
          {isRunning ? 'Pause' : 'Play'}
        </button>
        <button 
          onClick={() => {
            setIsRunning(false);
            setCurrentTime(0);
          }}
          className="control-button"
        >
          Reset
        </button>
        <select 
          value={speed} 
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="speed-select"
        >
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={5}>5x</option>
        </select>
      </div>
      <div className="parameter-controls-container">
        <ParameterControls 
          globalParameters={globalParameters}
          onParameterChange={handleParameterChange}
        />
      </div>
      <style>
        {`
          .tariff-game {
            width: 100%;
            height: 100vh;
            position: relative;
            background: #000;
          }
          .globe-container {
            width: 100%;
            height: 100%;
          }
          .controls {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            display: flex;
            gap: 10px;
            background: rgba(0, 0, 0, 0.7);
            padding: 10px;
            border-radius: 8px;
          }
          .control-button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            background: #4a90e2;
            color: white;
            cursor: pointer;
            font-size: 14px;
          }
          .control-button:hover {
            background: #357abd;
          }
          .speed-select {
            padding: 8px;
            border-radius: 4px;
            background: #333;
            color: white;
            border: 1px solid #555;
          }
          .parameter-controls-container {
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 1000;
            width: 300px;
          }
        `}
      </style>
    </div>
  );
} 