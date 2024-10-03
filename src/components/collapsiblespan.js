import React, { useState } from 'react';

const CollapsibleSpan = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleVisibility = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div class="show" className='show'>
      <button onClick={toggleVisibility}>
        {isOpen ? 'Minimize' : 'Open'}
      </button>
      <br/>
      {isOpen && (
        <span class="collapsible-content" className="collapsible-content">
          {children}
        </span>
      )}
    </div>
  );
};

export default CollapsibleSpan;
