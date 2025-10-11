import React from 'react';
import { Clock, AlertTriangle, ArrowUp } from 'lucide-react';

const SLAIndicator = ({ complaint, size = 'normal' }) => {
    if (!complaint) return null;
    
    // If no SLA data, don't render anything (SLA might not be initialized yet)
    if (!complaint.sla) return null;

    const { sla, escalation } = complaint;
    const isSmall = size === 'small';
    
    const formatTimeRemaining = (timeRemaining) => {
        if (!timeRemaining || timeRemaining <= 0) return 'Overdue';
        
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }
        return `${hours}h ${minutes}m`;
    };

    const getSLAStatus = () => {
        if (sla.isOverdue) {
            return {
                color: 'text-red-600 bg-red-50 border-red-200',
                icon: AlertTriangle,
                label: 'Overdue',
                timeText: formatTimeRemaining(sla.timeRemaining)
            };
        }
        
        // Calculate urgency based on time remaining
        const hoursRemaining = sla.timeRemaining / (1000 * 60 * 60);
        
        if (hoursRemaining <= 2) {
            return {
                color: 'text-orange-600 bg-orange-50 border-orange-200',
                icon: Clock,
                label: 'Critical',
                timeText: formatTimeRemaining(sla.timeRemaining)
            };
        } else if (hoursRemaining <= 6) {
            return {
                color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
                icon: Clock,
                label: 'Warning',
                timeText: formatTimeRemaining(sla.timeRemaining)
            };
        } else {
            return {
                color: 'text-green-600 bg-green-50 border-green-200',
                icon: Clock,
                label: 'On Track',
                timeText: formatTimeRemaining(sla.timeRemaining)
            };
        }
    };

    const getEscalationBadge = () => {
        if (!escalation || escalation.level === 0) return null;
        
        const badges = {
            1: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'L1' },
            2: { color: 'bg-orange-100 text-orange-800 border-orange-200', text: 'L2' },
            3: { color: 'bg-red-100 text-red-800 border-red-200', text: 'L3' }
        };
        
        const badge = badges[escalation.level];
        if (!badge) return null;
        
        return (
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded border ${badge.color}`}>
                <ArrowUp className={`${isSmall ? 'w-2.5 h-2.5' : 'w-3 h-3'} mr-1`} />
                {badge.text}
            </span>
        );
    };

    const status = getSLAStatus();
    const IconComponent = status.icon;
    
    if (isSmall) {
        return (
            <div className="flex items-center space-x-2">
                <div className={`flex items-center px-2 py-1 rounded text-xs border ${status.color}`}>
                    <IconComponent className="w-3 h-3 mr-1" />
                    <span className="font-medium">{status.timeText}</span>
                </div>
                {getEscalationBadge()}
            </div>
        );
    }

    return (
        <div className={`p-3 rounded-lg border ${status.color}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                    <IconComponent className="w-4 h-4 mr-2" />
                    <span className="font-medium text-sm">SLA Status: {status.label}</span>
                </div>
                {getEscalationBadge()}
            </div>
            
            <div className="text-sm">
                <div className="flex items-center justify-between">
                    <span>Time Remaining:</span>
                    <span className="font-medium">{status.timeText}</span>
                </div>
                
                {sla.deadline && (
                    <div className="flex items-center justify-between mt-1 text-xs opacity-75">
                        <span>Deadline:</span>
                        <span>{new Date(sla.deadline).toLocaleString()}</span>
                    </div>
                )}
                
                {sla.isOverdue && sla.breachedAt && (
                    <div className="flex items-center justify-between mt-1 text-xs">
                        <span>Breached:</span>
                        <span>{new Date(sla.breachedAt).toLocaleString()}</span>
                    </div>
                )}
                
                {escalation && escalation.escalatedAt && (
                    <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                        <div className="text-xs">
                            <div>Escalated: {new Date(escalation.escalatedAt).toLocaleString()}</div>
                            {escalation.escalationReason && (
                                <div className="mt-1">Reason: {escalation.escalationReason}</div>
                            )}
                            {escalation.escalatedTo && (
                                <div>To: {escalation.escalatedTo.name} ({escalation.escalatedTo.role})</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SLAIndicator;