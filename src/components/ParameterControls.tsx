import React from 'react';
import '../styles/ParameterControls.css';

interface ParameterControlsProps {
  globalParameters: {
    baseTariffRate: number;
    gdpGrowthRate: number;
    tradeMultiplier: number;
  };
  onParameterChange: (parameter: string, value: number) => void;
}

const ParameterControls: React.FC<ParameterControlsProps> = ({
  globalParameters,
  onParameterChange
}) => {
  return (
    <div className="parameter-controls">
      <div className="parameter-group">
        <label>
          Base Tariff Rate: {globalParameters.baseTariffRate}%
          <input
            type="range"
            min="0"
            max="100"
            value={globalParameters.baseTariffRate}
            onChange={(e) => onParameterChange('baseTariffRate', parseFloat(e.target.value))}
          />
        </label>
      </div>

      <div className="parameter-group">
        <label>
          GDP Growth Rate: {globalParameters.gdpGrowthRate}%
          <input
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={globalParameters.gdpGrowthRate}
            onChange={(e) => onParameterChange('gdpGrowthRate', parseFloat(e.target.value))}
          />
        </label>
      </div>

      <div className="parameter-group">
        <label>
          Trade Multiplier: {globalParameters.tradeMultiplier}x
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={globalParameters.tradeMultiplier}
            onChange={(e) => onParameterChange('tradeMultiplier', parseFloat(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
};

export default ParameterControls; 