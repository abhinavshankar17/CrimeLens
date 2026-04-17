import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter, Check } from 'lucide-react';

const StatusDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { value: '', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'investigating', label: 'Investigating' },
    { value: 'closed', label: 'Closed' }
  ];

  const currentLabel = options.find(opt => opt.value === value)?.label || 'All Statuses';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="custom-dropdown" ref={dropdownRef} style={{ position: 'relative', width: '200px' }}>
      <button 
        className="input-base" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} style={{ color: value ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
          <span>{currentLabel}</span>
        </div>
        <ChevronDown size={16} style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          opacity: 0.5
        }} />
      </button>

      {isOpen && (
        <div 
          className="glass-card" 
          style={{ 
            position: 'absolute', 
            top: 'calc(100% + 8px)', 
            left: 0, 
            right: 0, 
            zIndex: 1000,
            padding: '4px',
            animation: 'slide-in-top 0.2s ease forwards',
            background: 'rgba(20, 20, 30, 0.95)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            border: '1px solid var(--glass-border)'
          }}
        >
          {options.map((opt) => (
            <div 
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: value === opt.value ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                color: value === opt.value ? 'var(--accent-cyan)' : 'var(--text-primary)',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
              className="dropdown-item-hover"
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check size={14} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
