import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, TrendingUp, BarChart3, ArrowUp } from 'lucide-react';
import { apiService } from '../services/apiService';

const SLADashboard = () => {
    const [slaStats, setSlaStats] = useState(null);
    const [overdueComplaints, setOverdueComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchSLAData();
    }, []);

    const fetchSLAData = async () => {
        try {
            setLoading(true);
            
            // Check if apiService methods exist
            if (typeof apiService.getSLAStats !== 'function') {
                console.error('apiService.getSLAStats is not a function');
                console.error('Available methods:', Object.getOwnPropertyNames(apiService));
                
                // Use mock data for development
                setSlaStats({
                    totalActive: 0,
                    onTime: 0,
                    overdue: 0,
                    escalations: {
                        level1: 0,
                        level2: 0,
                        level3: 0,
                        total: 0
                    },
                    slaCompliance: 100
                });
                setOverdueComplaints([]);
                return;
            }
            
            console.log('Fetching SLA data...');
            const [statsResponse, overdueResponse] = await Promise.all([
                apiService.getSLAStats(),
                apiService.getOverdueComplaints()
            ]);

            console.log('SLA Stats Response:', statsResponse);
            console.log('Overdue Response:', overdueResponse);

            setSlaStats(statsResponse.data);
            setOverdueComplaints(overdueResponse.data.complaints || []);
        } catch (error) {
            console.error('Error fetching SLA data:', error);
            console.error('Error details:', error.response || error.message);
            
            // Fallback to mock data
            setSlaStats({
                totalActive: 0,
                onTime: 0,
                overdue: 0,
                escalations: {
                    level1: 0,
                    level2: 0,
                    level3: 0,
                    total: 0
                },
                slaCompliance: 100
            });
            setOverdueComplaints([]);
            setError('SLA data unavailable - showing demo view');
        } finally {
            setLoading(false);
        }
    };

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

    const getEscalationBadge = (level) => {
        const badges = {
            0: { color: 'bg-green-100 text-green-800', text: 'Normal' },
            1: { color: 'bg-yellow-100 text-yellow-800', text: 'Level 1' },
            2: { color: 'bg-orange-100 text-orange-800', text: 'Level 2' },
            3: { color: 'bg-red-100 text-red-800', text: 'Level 3' }
        };
        
        const badge = badges[level] || badges[0];
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                {badge.text}
            </span>
        );
    };

    const getComplianceColor = (compliance) => {
        if (compliance >= 90) return 'text-green-600';
        if (compliance >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <h3 className="font-medium mb-2">SLA Dashboard Error</h3>
                <p>{error}</p>
                <button 
                    onClick={fetchSLAData}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
                <div className="mt-4 p-4 bg-gray-50 rounded text-sm">
                    <p className="font-medium">Debug Info:</p>
                    <p>API Service available: {apiService ? 'Yes' : 'No'}</p>
                    <p>getSLAStats method: {typeof apiService?.getSLAStats}</p>
                    <p>getOverdueComplaints method: {typeof apiService?.getOverdueComplaints}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">SLA Dashboard</h2>
                <button
                    onClick={fetchSLAData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'overview'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('overdue')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'overdue'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Overdue Complaints ({overdueComplaints.length})
                    </button>
                </nav>
            </div>

            {activeTab === 'overview' && slaStats && (
                <div className="space-y-6">
                    {/* SLA Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow border">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <BarChart3 className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Active</p>
                                    <p className="text-2xl font-bold text-gray-900">{slaStats.totalActive}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow border">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Clock className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">On Time</p>
                                    <p className="text-2xl font-bold text-gray-900">{slaStats.onTime}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow border">
                            <div className="flex items-center">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                                    <p className="text-2xl font-bold text-gray-900">{slaStats.overdue}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow border">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
                                    <p className={`text-2xl font-bold ${getComplianceColor(slaStats.slaCompliance)}`}>
                                        {slaStats.slaCompliance}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Escalation Stats */}
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Escalation Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <div className="flex items-center justify-center mb-2">
                                    <ArrowUp className="w-5 h-5 text-yellow-600" />
                                    <span className="ml-1 font-medium text-yellow-800">Level 1</span>
                                </div>
                                <p className="text-2xl font-bold text-yellow-900">{slaStats.escalations.level1}</p>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="flex items-center justify-center mb-2">
                                    <ArrowUp className="w-5 h-5 text-orange-600" />
                                    <span className="ml-1 font-medium text-orange-800">Level 2</span>
                                </div>
                                <p className="text-2xl font-bold text-orange-900">{slaStats.escalations.level2}</p>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <div className="flex items-center justify-center mb-2">
                                    <ArrowUp className="w-5 h-5 text-red-600" />
                                    <span className="ml-1 font-medium text-red-800">Level 3</span>
                                </div>
                                <p className="text-2xl font-bold text-red-900">{slaStats.escalations.level3}</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-center mb-2">
                                    <span className="font-medium text-gray-800">Total</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{slaStats.escalations.total}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'overdue' && (
                <div className="space-y-4">
                    {overdueComplaints.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow border">
                            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Overdue Complaints</h3>
                            <p className="text-gray-600">All complaints are within SLA deadlines.</p>
                        </div>
                    ) : (
                        overdueComplaints.map((complaint) => (
                            <div key={complaint._id} className="bg-white p-6 rounded-lg shadow border border-red-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                #{complaint._id.slice(-6)}
                                            </h3>
                                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                                Overdue
                                            </span>
                                            {getEscalationBadge(complaint.escalation?.level || 0)}
                                        </div>
                                        
                                        <p className="text-gray-800 mb-3">{complaint.description}</p>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">Department:</span>
                                                <p>{complaint.department}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium">City:</span>
                                                <p>{complaint.city}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium">Submitted By:</span>
                                                <p>{complaint.submittedBy?.name || 'Unknown'}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium">Assigned To:</span>
                                                <p>{complaint.assignedTo?.name || 'Unassigned'}</p>
                                            </div>
                                        </div>

                                        {complaint.escalation?.escalatedAt && (
                                            <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                                                <p className="text-sm text-orange-800">
                                                    <span className="font-medium">Escalated:</span> {' '}
                                                    {new Date(complaint.escalation.escalatedAt).toLocaleString()}
                                                    {complaint.escalation.escalationReason && (
                                                        <span className="block mt-1">
                                                            Reason: {complaint.escalation.escalationReason}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="ml-4 text-right">
                                        <div className="text-sm text-gray-600 mb-1">Time Remaining</div>
                                        <div className="text-lg font-bold text-red-600">
                                            {formatTimeRemaining(complaint.sla?.timeRemaining)}
                                        </div>
                                        {complaint.sla?.breachedAt && (
                                            <div className="text-xs text-red-500 mt-1">
                                                Breached: {new Date(complaint.sla.breachedAt).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SLADashboard;