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
  // Add methods for HTML elements
  htmlElementsData?: (data: any[]) => GlobeInstance;
  htmlElement?: (elementFn: (d: any) => HTMLElement) => GlobeInstance;
  htmlTransitionDuration?: (duration: number) => GlobeInstance;
  onHtmlElementClick?: (callback: (d: any) => void) => GlobeInstance;
  onHtmlElementHover?: (callback: (d: any | null) => void) => GlobeInstance;
}

interface Country {
  id: string;
  name: string;
  gdp: number;
  previousGdp: number;
  gdpChange: number;
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
  laborProductivity: number;
  taxRate: number;
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
  globalParameters = { baseTariffRate: 5, gdpGrowthRate: 2, tradeMultiplier: 1, laborProductivity: 1, taxRate: 15 },
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
          .arcsTransitionDuration(1000)
          .htmlTransitionDuration(1000); // Transition for HTML elements

        globeRef.current = globe;
        setError(null);
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
      // Max absolute GDP change for scaling bar height (adjust scaling as needed)
      const maxAbsGdpChange = Math.max(...countries.map(c => Math.abs(c.gdpChange)), 1); // Avoid division by zero

      // Prepare HTML elements data for countries (GDP change bars)
      const htmlElementsData = countries.map(country => ({
        lat: country.coordinates.lat,
        lng: country.coordinates.lng,
        countryData: country, // Pass full country data
        gdpChange: country.gdpChange,
        name: country.name,
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
      // Cast to any to use dynamically added/extended methods
      (globeRef.current as any)
        .arcsData(arcsData)
        .arcColor(d => (d as any).color)
        .arcAltitude(0.2)
        .arcStroke(d => (d as any).width)
        // --- HTML Elements for GDP Bars --- 
        .htmlElementsData(htmlElementsData)
        .htmlElement(d => {
          const country = (d as any).countryData as Country;
          const elementData = d as any; // Capture data for listeners
          const el = document.createElement('div');
          el.className = 'gdp-bar-container';

          // Create Country Name Label
          const nameLabel = document.createElement('div');
          nameLabel.className = 'country-map-label name-label';
          nameLabel.textContent = country.name;
          el.appendChild(nameLabel);

          // Create GDP Value Label
          const gdpLabel = document.createElement('div');
          gdpLabel.className = 'country-map-label gdp-label';
          gdpLabel.textContent = `$${(country.gdp / 1000).toFixed(1)}T`; // Format GDP
          el.appendChild(gdpLabel);

          // Create GDP Change Bar
          const barContainer = document.createElement('div'); // Container to hold the bar itself
          barContainer.className = 'bar-visual-container';
          const bar = document.createElement('div');
          bar.className = 'gdp-bar';
          // Scale height based on GDP change magnitude (adjust scaling factor as needed)
          const barHeight = Math.min(50, Math.max(2, (Math.abs(country.gdpChange) / maxAbsGdpChange) * 50)); // Max 50px height, min 2px
          bar.style.height = `${barHeight}px`;
          bar.style.backgroundColor = country.gdpChange >= 0 ? '#4caf50' : '#f44336'; // Green for positive, Red for negative
          barContainer.appendChild(bar);
          el.appendChild(barContainer);
          
          // --- Add Event Listeners Directly --- 
          el.addEventListener('click', () => {
            handleElementClick(elementData); 
          });
          el.addEventListener('mouseover', () => {
            handleElementHover(elementData);
          });
          el.addEventListener('mouseout', () => {
            handleElementHover(null); // Clear hover on mouse out
          });

          return el;
        });
    } catch (err) {
      console.error('Error updating globe data:', err);
      setError('Error updating globe visualization.');
    }
  }, [countries, globalParameters, isRunning]);

  // Define the click handler function for HTML elements
  const handleElementClick = (elementData: any) => {
    if (!globeRef.current) return;
    
    try {
      if (elementData && elementData.id) {
        const country = countries.find(c => c.id === elementData.id);
        if (country) {
          setSelectedCountry(country);
        } else {
          setSelectedCountry(null);
        }
      } else {
        setSelectedCountry(null);
      }
    } catch (err) {
      console.error('Error handling globe click:', err);
      setSelectedCountry(null);
    }
  };

  // Handle mouse move for hover effects on HTML elements
  const handleElementHover = (elementData: any | null) => {
    if (!globeRef.current) return;
    
    try {
      if (elementData && elementData.id) {
        const country = countries.find(c => c.id === elementData.id);
        if (country) {
          setHoveredCountry(country);
        } else {
          setHoveredCountry(null);
        }
      } else {
        setHoveredCountry(null);
      }
    } catch (err) {
      console.error('Error handling globe mouse move:', err);
      setHoveredCountry(null);
    }
  };

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
          /* Styling for the GDP bars */
          .gdp-bar-container {
            pointer-events: auto; /* Allow clicks/hovers on the container */
            cursor: pointer;
            display: flex;
            flex-direction: column; /* Stack labels and bar vertically */
            align-items: center; /* Center items horizontally */
            justify-content: center;
            padding: 2px;
          }
          
          .country-map-label {
            font-size: 8px; /* Smaller font size for map labels */
            color: white;
            text-shadow: 1px 1px 2px black; /* Improve visibility */
            text-align: center;
            white-space: nowrap; /* Prevent wrapping */
            pointer-events: none; /* Labels shouldn't block interaction */
            margin-bottom: 1px;
          }
          
          .name-label {
            font-weight: bold;
          }
          
          .bar-visual-container { 
            /* Container to manage bar alignment if needed */
            display: flex;
            align-items: flex-end; /* Align bar to bottom */
            height: 50px; /* Fixed height for the bar area */
            width: 6px; /* Width of the bar visual */
          }
          
          .gdp-bar {
            width: 100%;
            background-color: grey; /* Default/fallback color */
            transition: height 0.5s ease-out, background-color 0.5s ease-out;
            border-radius: 1px;
          }

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