import React, { useState } from 'react';
import './src/Dropdown.css'; // Corrected the CSS import path

const Dropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown">
      <button onClick={toggleDropdown} className="dropdown-toggle">
        Dropdown Menu
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          <li className="dropdown-item">Item 1</li>
          <li className="dropdown-item">Item 2</li>
          <li className="dropdown-item">Item 3</li>
        </ul>
      )}
    </div>
  );
};

export default Dropdown;