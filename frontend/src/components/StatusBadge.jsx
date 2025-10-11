const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status?.toUpperCase()) {
      case 'OPEN':
        return 'status-badge status-open';
      case 'IN PROGRESS':
      case 'IN_PROGRESS':
        return 'status-badge status-progress';
      case 'RESOLVED':
        return 'status-badge status-resolved';
      default:
        return 'status-badge bg-gray-100 text-gray-800';
    }
  };

  const formatStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'OPEN':
        return 'Open';
      case 'RESOLVED':
        return 'Resolved';
      default:
        return status || 'Unknown';
    }
  };

  return (
    <span className={getStatusStyles(status)}>
      {formatStatusText(status)}
    </span>
  );
};

export default StatusBadge;