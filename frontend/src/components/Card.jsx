const Card = ({ children, className = '', padding = true, hover = false }) => {
  return (
    <div className={`
      card
      ${padding ? 'p-6' : ''}
      ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;