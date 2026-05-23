import React from 'react';
import { Plus, Shield, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onWriteClick: () => void;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  onResetDatabase: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onWriteClick,
  isAdminMode,
  setIsAdminMode,
  onResetDatabase
}) => {
  return (
    <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      
      <div className="space-y-1.5 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            피드백 게시판
          </h1>

        </div>
        
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-4xl">
          검은사막 모험가님들의 소중한 목소리와 건의 방향성에 대해, 개발진이 직접 진행 현황 및 검토 기준을 투명하게 전해 드리는 소통 소 광단입니다.
        </p>
      </div>

      <button 
        id="btnWrite"
        onClick={onWriteClick}
        className="w-full md:w-auto inline-flex items-center justify-center bg-slate-950 hover:bg-slate-800 text-white px-4.5 py-2 rounded-lg font-semibold text-xs tracking-tight transition duration-150 shadow-sm gap-1.5 cursor-pointer shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span>건의 등록하기</span>
      </button>
    </div>
  );
};
