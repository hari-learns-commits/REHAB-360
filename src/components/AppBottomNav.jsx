import React from 'react';

const AppBottomNav = ({ items, activeTab, onTabChange }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="mobile-bottom-nav">
      {items.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            {isActive && <div className="bottom-nav-indicator" />}
            {IconComponent && (
              <IconComponent
                size={21}
                className="bottom-nav-icon"
                color={isActive ? 'var(--strava-orange)' : '#6d6d78'}
              />
            )}
            <span className="bottom-nav-label">{item.shortLabel || item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default AppBottomNav;
