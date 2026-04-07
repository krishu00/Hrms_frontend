import React from 'react';
import '../../ComponentsCss/utils/Heading/Heading.css';

const Heading = ({ level = 1, children, className }) => {
  const Tag = `h${level}`;
  return (
    <Tag className={`heading ${className || ''}`}>
      {children}
    </Tag>
  );
};

export default Heading;



