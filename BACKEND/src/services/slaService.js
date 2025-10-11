// SLA Service for tracking and escalation
import { Complaint } from '../models/Complaint.js';
import { User } from '../models/User.js';
import { notifyCitizenOfStatusChange } from './notificationService.js';

// SLA Configuration (in hours)
const SLA_DEADLINES = {
    'Sanitation': 24,      // 24 hours
    'Plumbing': 48,        // 48 hours  
    'Structural': 72,      // 72 hours
    'Electrical': 12       // 12 hours (urgent)
};

// Escalation Configuration
const ESCALATION_CONFIG = {
    level1: {
        afterHours: 6,      // Escalate 6 hours after SLA breach
        escalateTo: 'supervisor'
    },
    level2: {
        afterHours: 12,     // Escalate 12 hours after SLA breach
        escalateTo: 'admin'
    },
    level3: {
        afterHours: 24,     // Escalate 24 hours after SLA breach
        escalateTo: 'global_admin'
    }
};

/**
 * Calculate SLA deadline for a complaint
 */
export const calculateSLADeadline = (complaint) => {
    const department = complaint.department || 'Sanitation';
    const slaHours = SLA_DEADLINES[department] || 24;
    
    const deadline = new Date(complaint.createdAt);
    deadline.setHours(deadline.getHours() + slaHours);
    
    return deadline;
};

/**
 * Update SLA status for a complaint
 */
export const updateSLAStatus = async (complaintId) => {
    try {
        const complaint = await Complaint.findById(complaintId);
        if (!complaint || complaint.status === 'RESOLVED') {
            return complaint;
        }

        const now = new Date();
        const deadline = complaint.sla?.deadline || calculateSLADeadline(complaint);
        
        // Calculate time remaining in hours
        const timeRemainingMs = deadline.getTime() - now.getTime();
        const timeRemainingHours = Math.max(0, Math.floor(timeRemainingMs / (1000 * 60 * 60)));
        
        const isOverdue = now > deadline;
        const wasNotOverdue = !complaint.sla?.isOverdue;
        
        // Update SLA fields
        const slaUpdate = {
            'sla.deadline': deadline,
            'sla.timeRemaining': timeRemainingHours,
            'sla.isOverdue': isOverdue
        };

        // If just became overdue, record breach time
        if (isOverdue && wasNotOverdue) {
            slaUpdate['sla.breachedAt'] = now;
            console.log(`🚨 SLA BREACH: Complaint ${complaintId} is now overdue`);
        }

        const updatedComplaint = await Complaint.findByIdAndUpdate(
            complaintId,
            { $set: slaUpdate },
            { new: true }
        );

        return updatedComplaint;
    } catch (error) {
        console.error('Error updating SLA status:', error);
        throw error;
    }
};

/**
 * Check if complaint should be escalated
 */
export const checkEscalation = async (complaint) => {
    if (!complaint.sla?.isOverdue || complaint.status === 'RESOLVED') {
        return null;
    }

    const now = new Date();
    const breachedAt = complaint.sla.breachedAt;
    if (!breachedAt) return null;

    const hoursOverdue = (now - breachedAt) / (1000 * 60 * 60);
    const currentLevel = complaint.escalation?.level || 0;

    let shouldEscalate = false;
    let newLevel = currentLevel;

    // Determine escalation level
    if (currentLevel === 0 && hoursOverdue >= ESCALATION_CONFIG.level1.afterHours) {
        shouldEscalate = true;
        newLevel = 1;
    } else if (currentLevel === 1 && hoursOverdue >= ESCALATION_CONFIG.level2.afterHours) {
        shouldEscalate = true;
        newLevel = 2;
    } else if (currentLevel === 2 && hoursOverdue >= ESCALATION_CONFIG.level3.afterHours) {
        shouldEscalate = true;
        newLevel = 3;
    }

    return shouldEscalate ? { level: newLevel, hoursOverdue } : null;
};

/**
 * Escalate complaint to next level
 */
export const escalateComplaint = async (complaintId, escalationLevel, reason = 'SLA_BREACH') => {
    try {
        const complaint = await Complaint.findById(complaintId).populate('assignedTo');
        if (!complaint) {
            throw new Error('Complaint not found');
        }

        // Find escalation target
        let escalationTarget = null;
        const city = complaint.city;

        if (escalationLevel === 1) {
            // Level 1: Escalate to department supervisor (find admin of same city)
            escalationTarget = await User.findOne({ 
                role: 'admin', 
                city: city,
                department: complaint.department 
            });
        } else if (escalationLevel === 2) {
            // Level 2: Escalate to city admin
            escalationTarget = await User.findOne({ 
                role: 'admin', 
                city: city 
            });
        } else if (escalationLevel === 3) {
            // Level 3: Escalate to global admin
            escalationTarget = await User.findOne({ 
                role: 'admin', 
                city: 'Global' 
            });
        }

        if (!escalationTarget) {
            console.warn(`No escalation target found for level ${escalationLevel}`);
            return complaint;
        }

        // Update complaint with escalation info
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            complaintId,
            {
                $set: {
                    'escalation.level': escalationLevel,
                    'escalation.escalatedAt': new Date(),
                    'escalation.escalatedTo': escalationTarget._id,
                    'escalation.autoEscalated': reason === 'SLA_BREACH',
                    'escalation.escalationReason': reason
                },
                $addToSet: {
                    assignedUsers: escalationTarget._id
                }
            },
            { new: true }
        ).populate(['assignedTo', 'escalation.escalatedTo', 'assignedUsers']);

        console.log(`📈 ESCALATED: Complaint ${complaintId} escalated to Level ${escalationLevel} (${escalationTarget.name})`);

        // Send notification about escalation
        // You can implement notification logic here

        return updatedComplaint;
    } catch (error) {
        console.error('Error escalating complaint:', error);
        throw error;
    }
};

/**
 * Batch process SLA updates for all active complaints
 */
export const processSLAUpdates = async () => {
    try {
        console.log('🔄 Starting SLA batch processing...');
        
        const activeComplaints = await Complaint.find({
            status: { $in: ['OPEN', 'IN_PROGRESS'] }
        });

        let updatedCount = 0;
        let escalatedCount = 0;

        for (const complaint of activeComplaints) {
            // Update SLA status
            const updatedComplaint = await updateSLAStatus(complaint._id);
            updatedCount++;

            // Check for escalation
            const escalationCheck = await checkEscalation(updatedComplaint);
            if (escalationCheck) {
                await escalateComplaint(
                    complaint._id, 
                    escalationCheck.level, 
                    'SLA_BREACH'
                );
                escalatedCount++;
            }
        }

        console.log(`✅ SLA Processing Complete: ${updatedCount} updated, ${escalatedCount} escalated`);
        return { updatedCount, escalatedCount };
    } catch (error) {
        console.error('Error in SLA batch processing:', error);
        throw error;
    }
};

/**
 * Initialize SLA for new complaint
 */
export const initializeSLA = async (complaintId) => {
    try {
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            throw new Error('Complaint not found');
        }

        const deadline = calculateSLADeadline(complaint);
        const now = new Date();
        const timeRemainingMs = deadline.getTime() - now.getTime();
        const timeRemainingHours = Math.max(0, Math.floor(timeRemainingMs / (1000 * 60 * 60)));

        await Complaint.findByIdAndUpdate(complaintId, {
            $set: {
                'sla.deadline': deadline,
                'sla.timeRemaining': timeRemainingHours,
                'sla.isOverdue': false
            }
        });

        console.log(`🎯 SLA Initialized: Complaint ${complaintId} - Deadline: ${deadline.toLocaleString()}`);
        return deadline;
    } catch (error) {
        console.error('Error initializing SLA:', error);
        throw error;
    }
};

export { SLA_DEADLINES, ESCALATION_CONFIG };