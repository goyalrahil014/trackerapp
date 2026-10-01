import React from 'react';
import { Check, X } from 'lucide-react';
import type { DayHistoryItem, HabitType } from '../../types/habit';
import { Tooltip } from '../ui/Tooltip';

interface HabitHistoryProps {
  history: DayHistoryItem[];
  habitType: HabitType;
}

export const HabitHistory: React.FC<HabitHistoryProps> = ({ history, habitType }) => {
  if (!history || history.length === 0) return null;

  const oldestDay = history[0];
  const todayDay = history[history.length - 1];

  const getStatusLabel = (item: DayHistoryItem) => {
    if (item.status === 'success') {
      return habitType === 'good' ? '✓ Completed' : '✓ Successfully Avoided';
    }
    if (item.status === 'failure') {
      return habitType === 'good' ? '✗ Not Completed' : '✗ Habit Slipped';
    }
    return item.isBeforeCreation ? '• Before habit was created' : '• No record';
  };

  return (
    <div className="w-full space-y-2">
      {/* 30-Day Ticks Row */}
      <div className="flex items-center justify-between gap-1 sm:gap-1.5 overflow-x-auto py-1.5 scrollbar-thin">
        {history.map((day) => {
          const isSuccess = day.status === 'success';
          const isFailure = day.status === 'failure';
          const isUnrecorded = day.status === 'unrecorded';

          return (
            <Tooltip
              key={day.date}
              content={
                <div className="text-center px-1 py-0.5 space-y-0.5">
                  <div className="text-[11px] font-semibold text-slate-200">
                    {day.displayDate} {day.isToday && <span className="text-indigo-400 font-bold">(Today)</span>}
                  </div>
                  <div
                    className={`text-[11px] font-medium flex items-center justify-center gap-1 ${
                      isSuccess
                        ? 'text-emerald-400'
                        : isFailure
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {getStatusLabel(day)}
                  </div>
                </div>
              }
            >
              <div
                className={`relative flex items-center justify-center rounded-md transition-all duration-150 cursor-pointer select-none
                  w-[9px] h-6 sm:w-3 sm:h-7 md:w-3.5 md:h-7 shrink-0
                  ${
                    day.isToday
                      ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900'
                      : ''
                  }
                  ${
                    isSuccess
                      ? 'bg-emerald-500/90 text-white hover:bg-emerald-500 shadow-sm shadow-emerald-500/20'
                      : isFailure
                      ? 'bg-rose-500/90 text-white hover:bg-rose-500 shadow-sm shadow-rose-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-400 dark:text-slate-500'
                  }
                `}
                aria-label={`${day.displayDate}: ${day.status}`}
              >
                {isSuccess && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />}
                {isFailure && <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />}
                {isUnrecorded && <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />}
              </div>
            </Tooltip>
          );
        })}
      </div>

      {/* Date Range Labels: LEFT = Oldest, RIGHT = Today */}
      <div className="flex justify-between items-center text-[11px] font-medium text-slate-400 dark:text-slate-500 px-0.5">
        <span>{oldestDay?.shortDate || '30 days ago'}</span>
        <span className="text-slate-300 dark:text-slate-600 text-[10px] hidden sm:inline">
          30-day timeline
        </span>
        <span className="font-semibold text-slate-600 dark:text-slate-300">
          {todayDay?.shortDate || 'Today'} (Today)
        </span>
      </div>
    </div>
  );
};
