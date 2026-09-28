import React from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  AlertCircle,
  Clock,
  ShieldAlert,
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { GovernanceAlert } from '../types';

interface GovernanceAlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: GovernanceAlert[];
  onAcknowledgeAlert: (id: string) => void;
  onNavigateToAction: (actionUrl: string) => void;
}

export const GovernanceAlertsDrawer: React.FC<GovernanceAlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledgeAlert,
  onNavigateToAction
}) => {
  if (!isOpen) return null;

  const getAlertIcon = (type: GovernanceAlert['type']) => {
    switch (type) {
      case 'ENACTMENT_GAP':
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'CRITICAL_RISK':
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'LAGGING_KPI':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'AUDIT_DEADLINE':
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: GovernanceAlert['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">MEDIUM</span>;
      case 'INFO':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">INFO</span>;
    }
  };

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-900 text-white">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold">Governance &amp; Statutory Alerts</h2>
              <p className="text-[11px] text-emerald-200">
                {unacknowledgedCount} unacknowledged automated trigger{unacknowledgedCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-emerald-200 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No active governance alerts detected.
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                id={`alert-item-${alert.id}`}
                className={`pt-3 first:pt-0 ${alert.acknowledged ? 'opacity-60' : ''}`}
              >
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:border-emerald-500 transition space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {alert.title}
                      </span>
                    </div>
                    {getSeverityBadge(alert.severity)}
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {alert.message}
                  </p>

                  {alert.programName && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      Initiative: {alert.programName}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-400">
                    <span>{alert.timestamp}</span>

                    <div className="flex items-center gap-2">
                      {alert.actionUrl && (
                        <button
                          onClick={() => {
                            onNavigateToAction(alert.actionUrl!);
                            onClose();
                          }}
                          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                        >
                          Resolve <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      {!alert.acknowledged ? (
                        <button
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 dark:text-slate-300 font-medium transition flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Acknowledge
                        </button>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-850 text-[11px] text-slate-500">
          Automated triggers generated in accordance with Sabah State Library Internal Audit protocols.
        </div>

      </div>
    </div>
  );
};
