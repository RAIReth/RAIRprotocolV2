import React from 'react';
import '../styles/ParameterControls.css';

interface GlobalParameters {
  baseTariffRate: number;
  gdpGrowthRate: number;
  tradeMultiplier: number;
  laborProductivity: number;
  taxRate: number;
}

interface ParameterControlsProps {
  globalParameters: GlobalParameters;
  onParameterChange: (parameter: keyof GlobalParameters, value: number) => void;
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

      <div className="parameter-group">
        <label>
          Labor Productivity: {globalParameters.laborProductivity.toFixed(2)}
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={globalParameters.laborProductivity}
            onChange={(e) => onParameterChange('laborProductivity', parseFloat(e.target.value))}
          />
        </label>
      </div>

      <div className="parameter-group">
        <label>
          Tax Rate: {globalParameters.taxRate}%
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={globalParameters.taxRate}
            onChange={(e) => onParameterChange('taxRate', parseFloat(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
};

export default ParameterControls; 