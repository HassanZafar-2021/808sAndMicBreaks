import React from 'react';

const EffectsPanel = ({ effects, onEffectChange, onPresetApply }) => {
  const handleSliderChange = (effectName, event) => {
    const value = parseInt(event.target.value);
    onEffectChange(effectName, value);
  };

  const handlePresetClick = (presetName) => {
    onPresetApply(presetName);
  };

  return (
    <div className="effects-panel">
      <h3>Auto-Tune Settings</h3>
      
      <div className="control-group">
        <label htmlFor="pitchShift">Pitch Shift (semitones)</label>
        <input 
          type="range" 
          id="pitchShift" 
          min="-12" 
          max="12" 
          value={effects.pitchShift}
          step="1"
          onChange={(e) => handleSliderChange('pitchShift', e)}
        />
        <span className="control-value">{effects.pitchShift}</span>
      </div>

      <div className="control-group">
        <label htmlFor="autotuneStrength">Auto-Tune Strength</label>
        <input 
          type="range" 
          id="autotuneStrength" 
          min="0" 
          max="100" 
          value={effects.autotuneStrength}
          step="1"
          onChange={(e) => handleSliderChange('autotuneStrength', e)}
        />
        <span className="control-value">{effects.autotuneStrength}%</span>
      </div>

      <div className="control-group">
        <label htmlFor="reverbAmount">Reverb</label>
        <input 
          type="range" 
          id="reverbAmount" 
          min="0" 
          max="100" 
          value={effects.reverbAmount}
          step="1"
          onChange={(e) => handleSliderChange('reverbAmount', e)}
        />
        <span className="control-value">{effects.reverbAmount}%</span>
      </div>

      <div className="control-group">
        <label htmlFor="delayTime">Delay Time (ms)</label>
        <input 
          type="range" 
          id="delayTime" 
          min="0" 
          max="500" 
          value={effects.delayTime}
          step="10"
          onChange={(e) => handleSliderChange('delayTime', e)}
        />
        <span className="control-value">{effects.delayTime}ms</span>
      </div>

      <div className="preset-buttons">
        <button 
          className="preset-btn" 
          onClick={() => handlePresetClick('kanye')}
        >
          Kanye Mode
        </button>
        <button 
          className="preset-btn" 
          onClick={() => handlePresetClick('tpain')}
        >
          T-Pain Mode
        </button>
        <button 
          className="preset-btn" 
          onClick={() => handlePresetClick('robot')}
        >
          Robot Mode
        </button>
        <button 
          className="preset-btn" 
          onClick={() => handlePresetClick('clear')}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default EffectsPanel;
