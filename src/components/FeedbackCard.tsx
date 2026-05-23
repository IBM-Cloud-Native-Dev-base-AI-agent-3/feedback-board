import React from 'react';
import { Heart } from 'lucide-react';
import { FeedbackItem, ProcessStatus } from '../types';
import { formatViews, getStatusLabel, getStatusStyle } from '../hooks/useFeedback';

interface FeedbackCardProps {
  item: FeedbackItem;
  isAdminMode: boolean;
  onCardClick: (item: FeedbackItem) => void;
  onSympathyToggle: (id: string, e: React.MouseEvent) => void;
  onAdminStatusChange: (id: string, newStatus: ProcessStatus) => void;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  item,
  isAdminMode,
  onCardClick,
  onSympathyToggle,
  onAdminStatusChange
}) => {
  const statusStyle = getStatusStyle(item.status);

  return (
    <div 
      onClick={() => onCardClick(item)}
      className={`bg-white border hover:border-slate-300 rounded-xl transition-all duration-150 cursor-pointer p-3 relative shadow-xs hover:shadow-xs ${
        item.type === 'noti' 
          ? 'border-slate-200 bg-slate-50/60' 
          : 'border-slate-200/80'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Left Block Details */}
        <div className="flex items-start gap-4 flex-1">
          
          {/* Vote Sympathy Small Counter Box */}
          <button 
            onClick={(e) => onSympathyToggle(item.id, e)}
            className={`flex flex-col items-center justify-center rounded-lg p-1 min-w-[44px] h-[46px] border transition cursor-pointer ${
              item.voted === 'up' 
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm' 
                : 'bg-white border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-rose-600'
            }`}
          >
            <Heart className={`w-5 h-5 ${item.voted === 'up' ? 'fill-current' : ''}`} />
            <span className="text-[11px] font-bold leading-none">{item.sympathy}</span>
          </button>

          <div className="space-y-0.5 flex-1">
            <h3 className="text-sm font-semibold text-slate-800 hover:text-slate-950 transition-colors leading-tight">
              {item.title}
            </h3>

            {/* Tag pills string */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1.5">
                {item.tags.map((t, idx) => (
                  <span key={idx} className="bg-slate-50 border border-slate-200/50 text-slate-500 text-[9px] px-1.5 py-0.5 rounded font-medium">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Meta Data Column */}
        <div className="flex flex-col gap-2 border-t sm:border-t-0 border-slate-100 pt-2.5 sm:pt-0 sm:flex-row sm:flex-nowrap sm:items-start sm:gap-3.5">
          
          {/* Comments and views */}
          <div className="flex flex-col items-start gap-0.5 text-xs font-normal text-slate-500 min-w-[72px]">
            <span className="inline-flex items-center gap-1" title="조회수">
              <span>조회수</span>
              <span>{formatViews(item.views)}</span>
            </span>
            <span className="inline-flex items-center gap-1" title="댓글수">
              <span>댓글수</span>
              <span>{item.commentsCount}</span>
            </span>
          </div>

          {/* Writer Class Profile */}
          <div className="flex items-center gap-2 min-w-[140px] max-w-[180px] justify-start">
            {item.profileImg ? (
              <img 
                src={item.profileImg} 
                alt="" 
                className="w-6.5 h-6.5 rounded-full object-cover border border-slate-100 bg-slate-50" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://s1.pearlcdn.com/account/Upload/ProfileImage/20211/27/efa86232f2a20210127171810078';
                }}
              />
            ) : (
              <div className="w-6.5 h-6.5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold border border-slate-200">
                {item.author.charAt(0)}
              </div>
            )}
            <div className="min-w-0 text-left text-xs font-normal text-slate-500">
              <p className="truncate leading-none" title={item.author}>
                {item.author}
              </p>
              <span className="leading-none">{item.date}</span>
            </div>
          </div>

          {/* Dynamic status or Select option */}
          <div className="min-w-[92px] text-right sm:ml-auto">
            {isAdminMode && item.type !== 'noti' ? (
              <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                <select
                  value={item.status}
                  onChange={(e) => onAdminStatusChange(item.id, Number(e.target.value) as ProcessStatus)}
                  className="text-[11px] font-bold border border-slate-300 rounded px-1.5 py-1 bg-white text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value={ProcessStatus.DISCUSSING}>논의중</option>
                  <option value={ProcessStatus.IN_PROGRESS}>진행중</option>
                  <option value={ProcessStatus.APPLIED}>적용 완료</option>
                  <option value={ProcessStatus.REVIEW_COMPLETE}>검토 완료</option>
                </select>
              </div>
            ) : (
              <span className={`inline-flex w-[92px] items-center justify-center px-0 py-1.5 font-semibold rounded-xl text-xs border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                {getStatusLabel(item.status)}
              </span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
