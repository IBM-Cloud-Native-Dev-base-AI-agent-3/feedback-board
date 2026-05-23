import React from 'react';
import { Plus, Shield } from 'lucide-react';
import { User } from '../types/feedback';

interface HeaderProps {
  onWriteClick: () => void;
  currentUser: User | null;
  usersList: User[];
  onUserChange: (username: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onWriteClick,
  currentUser,
  usersList,
  onUserChange
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
          검은사막 공식 홈페이지 스타일의 피드백 게시판으로, 유저들의 건의 사항 및 논의 진행 상황을 투명하게 확인하고 소통할 수 있는 피드백 포럼입니다. 검은사막 공식 홈페이지 스타일의 피드백 게시판으로, 유저들의 건의 사항 및 논의 진행 상황을 투명하게 확인하고 소통할 수 있는 피드백 포럼입니다.
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
