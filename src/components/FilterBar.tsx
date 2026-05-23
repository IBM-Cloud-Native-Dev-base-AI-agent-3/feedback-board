import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ProcessStatus } from '../types';
import { SortType } from '../hooks/useFeedback';

interface FilterBarProps {
  activeStatus: ProcessStatus;
  setActiveStatus: (status: ProcessStatus) => void;
  duration: number;
  setDuration: (days: number) => void;
  isDurationDropdownOpen: boolean;
  setIsDurationDropdownOpen: (open: boolean) => void;
  sortType: SortType;
  setSortType: (type: SortType) => void;
  sortOrder: boolean;
  setSortOrder: (order: boolean) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeStatus,
  setActiveStatus,
  duration,
  setDuration,
  isDurationDropdownOpen,
  setIsDurationDropdownOpen,
  sortType,
  setSortType,
  sortOrder,
  setSortOrder
}) => {
  const durationOptions = [
    { label: '전체 기간', value: 0 },
    { label: '최근 1일', value: 1 },
    { label: '최근 7일', value: 7 },
    { label: '최근 30일', value: 30 },
    { label: '최근 100일', value: 100 },
    { label: '최근 1년', value: 365 }
  ];

  const getDurationLabel = (val: number) => {
    return durationOptions.find(o => o.value === val)?.label || '전체 기간';
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-2.5 border-b border-slate-100">
      
      {/* Left Tabs */}
      <div className="flex flex-wrap gap-1">
        <button 
          onClick={() => setActiveStatus(ProcessStatus.ALL)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer border ${
            activeStatus === ProcessStatus.ALL 
              ? "bg-slate-700 text-white border-slate-800 shadow-md ring-1 ring-slate-300" 
              : "text-slate-600 hover:text-slate-800 bg-slate-100 border-slate-200"
          }`}
        >
          전체보기
        </button>
        <button 
          onClick={() => setActiveStatus(ProcessStatus.DISCUSSING)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition border cursor-pointer ${
            activeStatus === ProcessStatus.DISCUSSING 
              ? "bg-slate-700 text-white border-slate-800 shadow-md ring-1 ring-slate-300" 
              : "text-slate-600 hover:text-slate-800 bg-slate-100 border-slate-200"
          }`}
        >
          논의중
        </button>
        <button 
          onClick={() => setActiveStatus(ProcessStatus.IN_PROGRESS)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition border cursor-pointer ${
            activeStatus === ProcessStatus.IN_PROGRESS 
              ? "bg-slate-700 text-white border-slate-800 shadow-md ring-1 ring-slate-300" 
              : "text-slate-600 hover:text-slate-800 bg-slate-100 border-slate-200"
          }`}
        >
          진행중
        </button>
        <button 
          onClick={() => setActiveStatus(ProcessStatus.APPLIED)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition border cursor-pointer ${
            activeStatus === ProcessStatus.APPLIED 
              ? "bg-slate-700 text-white border-slate-800 shadow-md ring-1 ring-slate-300" 
              : "text-slate-600 hover:text-slate-800 bg-slate-100 border-slate-200"
          }`}
        >
          적용 완료
        </button>
        <button 
          onClick={() => setActiveStatus(ProcessStatus.REVIEW_COMPLETE)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition border cursor-pointer ${
            activeStatus === ProcessStatus.REVIEW_COMPLETE 
              ? "bg-slate-700 text-white border-slate-800 shadow-md ring-1 ring-slate-300" 
              : "text-slate-600 hover:text-slate-800 bg-slate-100 border-slate-200"
          }`}
        >
          검토 완료
        </button>
      </div>

      {/* Right Sorters */}
      <div className="flex flex-wrap items-center gap-2.5">
        
        {/* Duration filter */}
        <div className="relative">
          <button 
            onClick={() => setIsDurationDropdownOpen(!isDurationDropdownOpen)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-800 hover:border-slate-300 transition cursor-pointer"
          >
            <span>{getDurationLabel(duration)}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {isDurationDropdownOpen && (
            <div className="absolute right-0 mt-1 z-30 w-32 bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden py-0.5">
              {durationOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setDuration(opt.value);
                    setIsDurationDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                    duration === opt.value 
                      ? 'bg-slate-50 text-slate-800 font-bold' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hidden sm:block h-3.5 w-[1px] bg-slate-200"></div>

        {/* Order Sorters */}
        <div className="flex items-center gap-1 bg-slate-100/50 p-0.5 rounded-lg border border-slate-200/40">
          {[
            { label: '최근 등록순', key: 'feedback_recent' as const },
            { label: '조회순', key: 'views' as const },
            { label: '댓글순', key: 'comments' as const },
            { label: '공감순', key: 'sympathy' as const }
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => {
                if (sortType === s.key) {
                  setSortOrder(!sortOrder);
                } else {
                  setSortType(s.key);
                  setSortOrder(false);
                }
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                sortType === s.key 
                  ? 'bg-slate-700 text-white shadow-md ring-1 ring-slate-300' 
                  : 'bg-slate-100 text-slate-600 hover:text-slate-800'
              }`}
            >
              <span>{s.label}</span>
              {sortType === s.key && (
                <span className="text-[8px] ml-0.5 opacity-80">
                  {sortOrder ? '▲' : '▼'}
                </span>
              )}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
