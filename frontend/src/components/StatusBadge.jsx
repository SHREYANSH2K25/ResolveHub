const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status?.toUpperCase()) {
      case 'OPEN':
        return 'status-badge status-open';
      case 'IN PROGRESS':
        return 'status-badge status-progress';
      case 'RESOLVED':
        return 'status-badge status-resolved';
      default:
        return 'status-badge bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={getStatusStyles(status)}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;