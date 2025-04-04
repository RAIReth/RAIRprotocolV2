import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Define a type for the Globe instance
interface GlobeInstance {
  globeImageUrl: (url: string) => GlobeInstance;
  bumpImageUrl: (url: string) => GlobeInstance;
  backgroundImageUrl: (url: string) => GlobeInstance;
  width: (width: number) => GlobeInstance;
  height: (height: number) => GlobeInstance;
  backgroundColor: (color: string) => GlobeInstance;
  pointsData: (data: any[]) => GlobeInstance;
  pointColor: (color: string | ((d: any) => string)) => GlobeInstance;
  pointRadius: (radius: number | ((d: any) => number)) => GlobeInstance;
  pointAltitude: (altitude: number | ((d: any) => number)) => GlobeInstance;
  pointsMerge: (merge: boolean) => GlobeInstance;
  pointsTransitionDuration: (duration: number) => GlobeInstance;
  arcsData: (data: any[]) => GlobeInstance;
  arcColor: (color: string | ((d: any) => string)) => GlobeInstance;
  arcAltitude: (altitude: number | ((d: any) => number)) => GlobeInstance;
  arcStroke: (stroke: number | ((d: any) => number)) => GlobeInstance;
  arcsTransitionDuration: (duration: number) => GlobeInstance;
  _destructor: () => void;
  // Add methods for accessing internal objects
  renderer?: () => any;
  camera?: () => any;
}

interface Country {
  id: string;
  name: string;
  gdp: number;
  previousGdp: number;
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

interface GlobalParameters {
  baseTariffRate: number;
  gdpGrowthRate: number;
  tradeMultiplier: number;
}

interface TariffGlobeProps {
  width?: number;
  height?: number;
  countries?: Country[];
  globalParameters?: GlobalParameters;
  isRunning?: boolean;
}

export default function TariffGlobe({ 
  width = 800, 
  height = 600,
  countries = [],
  globalParameters = { baseTariffRate: 5, gdpGrowthRate: 2, tradeMultiplier: 1 },
  isRunning = false
}: TariffGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize globe
  useEffect(() => {
    if (!containerRef.current || !isClient) return;

    // Dynamically import globe.gl only on client-side
    import('globe.gl')
      .then((GlobeModule) => {
        const Globe = GlobeModule.default;
        
        // Initialize globe
        const globe = new Globe(containerRef.current as HTMLElement)
          .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
          .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
          .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
          .width(width)
          .height(height)
          .backgroundColor('rgba(0,0,0,0)')
          .pointsTransitionDuration(1000)
          .arcsTransitionDuration(1000);

        globeRef.current = globe;
        setError(null);
        
        // Set up event listeners after globe is initialized
        try {
          const renderer = (globe as any).renderer();
          if (renderer && renderer.domElement) {
            renderer.domElement.addEventListener('click', handleGlobeClick);
            renderer.domElement.addEventListener('mousemove', handleGlobeMouseMove);
          }
        } catch (err) {
          console.error('Error setting up event listeners:', err);
        }
      })
      .catch(err => {
        console.error('Failed to load globe.gl:', err);
        setError('Failed to load globe visualization. Please check your internet connection.');
      });

    // Cleanup
    return () => {
      if (globeRef.current) {
        globeRef.current._destructor();
      }
    };
  }, [width, height, isClient]);

  // Update globe data when countries or parameters change
  useEffect(() => {
    if (!globeRef.current || !countries.length) return;

    try {
      // Prepare points data for countries
      const pointsData = countries.map(country => ({
        lat: country.coordinates.lat,
        lng: country.coordinates.lng,
        size: Math.log10(country.gdp) / 2, // Scale point size based on GDP
        name: country.name,
        gdp: country.gdp,
        previousGdp: country.previousGdp,
        id: country.id
      }));

      // Prepare arcs data for trade relationships
      const arcsData = countries.flatMap(country => 
        country.tradePartners.map(partner => {
          const partnerCountry = countries.find(c => c.id === partner.countryId);
          if (!partnerCountry) return null;
          
          return {
            startLat: country.coordinates.lat,
            startLng: country.coordinates.lng,
            endLat: partnerCountry.coordinates.lat,
            endLng: partnerCountry.coordinates.lng,
            color: `rgba(255, 255, 255, ${partner.tariffRate / 20})`, // Opacity based on tariff rate
            width: Math.log10(partner.importVolume + partner.exportVolume) / 2 // Width based on trade volume
          };
        }).filter(Boolean) as any[]
      );

      // Update globe with new data
      globeRef.current
        .pointsData(pointsData)
        .pointColor(() => '#ff4444')
        .pointRadius(d => (d as any).size)
        .pointAltitude(0.1)
        .pointsMerge(false)
        .arcsData(arcsData)
        .arcColor(d => (d as any).color)
        .arcAltitude(0.2)
        .arcStroke(d => (d as any).width);
    } catch (err) {
      console.error('Error updating globe data:', err);
      setError('Error updating globe visualization.');
    }
  }, [countries, globalParameters, isRunning]);

  // Define the click handler function
  const handleGlobeClick = (event: MouseEvent) => {
    if (!globeRef.current) return;
    
    try {
      // Get the mouse position relative to the renderer
      const renderer = (globeRef.current as any).renderer();
      if (!renderer || !renderer.domElement) return;
      
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Use the camera to get the ray
      const camera = (globeRef.current as any).camera();
      if (!camera) return;
      
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      
      // Get the points data
      const pointsData = (globeRef.current as any).pointsData();
      if (!pointsData || !pointsData.length) return;
      
      // Find the closest point
      const intersects = raycaster.intersectObjects(pointsData);
      if (intersects.length > 0) {
        const point = intersects[0].object.userData;
        if (point && point.id) {
          const country = countries.find(c => c.id === point.id);
          if (country) {
            setSelectedCountry(country);
          }
        }
      } else {
        setSelectedCountry(null);
      }
    } catch (err) {
      console.error('Error handling globe click:', err);
    }
  };

  // Handle mouse move for hover effects
  const handleGlobeMouseMove = (event: MouseEvent) => {
    if (!globeRef.current) return;
    
    try {
      // Get the mouse position relative to the renderer
      const renderer = (globeRef.current as any).renderer();
      if (!renderer || !renderer.domElement) return;
      
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Use the camera to get the ray
      const camera = (globeRef.current as any).camera();
      if (!camera) return;
      
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      
      // Get the points data
      const pointsData = (globeRef.current as any).pointsData();
      if (!pointsData || !pointsData.length) {
        setHoveredCountry(null);
        return;
      }
      
      // Find the closest point
      const intersects = raycaster.intersectObjects(pointsData);
      if (intersects.length > 0) {
        const point = intersects[0].object.userData;
        if (point && point.id) {
          const country = countries.find(c => c.id === point.id);
          if (country) {
            setHoveredCountry(country);
          }
        }
      } else {
        setHoveredCountry(null);
      }
    } catch (err) {
      console.error('Error handling globe mouse move:', err);
      setHoveredCountry(null);
    }
  };

  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      if (globeRef.current) {
        try {
          const renderer = (globeRef.current as any).renderer();
          if (renderer && renderer.domElement) {
            renderer.domElement.removeEventListener('click', handleGlobeClick);
            renderer.domElement.removeEventListener('mousemove', handleGlobeMouseMove);
          }
        } catch (err) {
          console.error('Error cleaning up event listeners:', err);
        }
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {error && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      
      {hoveredCountry && !selectedCountry && (
        <div className="country-hover-label">
          <div className="country-name">{hoveredCountry.name}</div>
          <div className="country-gdp">${(hoveredCountry.gdp / 1000).toFixed(1)}T</div>
          <div className={`country-growth ${hoveredCountry.gdp > hoveredCountry.previousGdp ? 'growing' : 'shrinking'}`}>
            {hoveredCountry.gdp > hoveredCountry.previousGdp ? '🟢' : '🔴'} 
            {((hoveredCountry.gdp - hoveredCountry.previousGdp) / hoveredCountry.previousGdp * 100).toFixed(1)}%
          </div>
        </div>
      )}
      
      {selectedCountry && (
        <div className="country-details">
          <h3>{selectedCountry.name}</h3>
          <div className="detail-row">
            <span>GDP:</span>
            <span>${(selectedCountry.gdp / 1000).toFixed(1)}T</span>
          </div>
          <div className="detail-row">
            <span>Population:</span>
            <span>{(selectedCountry.population).toFixed(1)}M</span>
          </div>
          <div className="detail-row">
            <span>Growth:</span>
            <span className={selectedCountry.gdp > selectedCountry.previousGdp ? 'growing' : 'shrinking'}>
              {selectedCountry.gdp > selectedCountry.previousGdp ? '🟢' : '🔴'} 
              {((selectedCountry.gdp - selectedCountry.previousGdp) / selectedCountry.previousGdp * 100).toFixed(1)}%
            </span>
          </div>
          <h4>Trade Partners</h4>
          <div className="trade-partners">
            {selectedCountry.tradePartners.map(partner => {
              const partnerCountry = countries.find(c => c.id === partner.countryId);
              if (!partnerCountry) return null;
              
              return (
                <div key={partner.countryId} className="trade-partner">
                  <div className="partner-name">{partnerCountry.name}</div>
                  <div className="partner-stats">
                    <div>Import: ${partner.importVolume}B</div>
                    <div>Export: ${partner.exportVolume}B</div>
                    <div>Tariff: {partner.tariffRate}%</div>
                  </div>
                </div>
              );
            })}
          </div>
          <button 
            className="close-button"
            onClick={() => setSelectedCountry(null)}
          >
            Close
          </button>
        </div>
      )}
      
      <style>
        {`
          .country-label {
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: auto;
            cursor: pointer;
            transition: background 0.2s;
          }
          
          .country-hover-label {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 1000;
            pointer-events: none;
          }
          
          .country-label:hover {
            background: rgba(0, 0, 0, 0.9);
          }
          
          .country-name {
            font-weight: bold;
          }
          
          .country-gdp {
            font-size: 11px;
            opacity: 0.8;
          }
          
          .country-growth {
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 2px;
          }
          
          .growing {
            color: #4caf50;
          }
          
          .shrinking {
            color: #f44336;
          }
          
          .country-details {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 8px;
            width: 300px;
            z-index: 1000;
          }
          
          .country-details h3 {
            margin-top: 0;
            margin-bottom: 10px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding-bottom: 5px;
          }
          
          .country-details h4 {
            margin-top: 15px;
            margin-bottom: 10px;
            font-size: 14px;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 14px;
          }
          
          .trade-partners {
            max-height: 200px;
            overflow-y: auto;
          }
          
          .trade-partner {
            background: rgba(255, 255, 255, 0.1);
            padding: 8px;
            border-radius: 4px;
            margin-bottom: 8px;
          }
          
          .partner-name {
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .partner-stats {
            font-size: 12px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5px;
          }
          
          .close-button {
            margin-top: 10px;
            padding: 5px 10px;
            background: #4a90e2;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
          }
          
          .close-button:hover {
            background: #357abd;
          }
        `}
      </style>
    </div>
  );
} 