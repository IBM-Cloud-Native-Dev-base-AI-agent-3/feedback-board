import React from 'react';
import { X } from 'lucide-react';

interface WriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  newCategory: string;
  setNewCategory: (val: string) => void;
  newClassAvatar: string;
  setNewClassAvatar: (val: string) => void;
  newAuthor: string;
  setNewAuthor: (val: string) => void;
  newTitle: string;
  setNewTitle: (val: string) => void;
  newDescription: string;
  setNewDescription: (val: string) => void;
  newTagsString: string;
  setNewTagsString: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const WriteModal: React.FC<WriteModalProps> = ({
  isOpen,
  onClose,
  newCategory,
  setNewCategory,
  newClassAvatar,
  setNewClassAvatar,
  newAuthor,
  setNewAuthor,
  newTitle,
  setNewTitle,
  newDescription,
  setNewDescription,
  newTagsString,
  setNewTagsString,
  onSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs overflow-y-auto animate-fade-in">
      
      <div className="bg-white border border-slate-200 max-w-4xl w-full max-h-[85vh] overflow-y-auto rounded-xl shadow-xl relative flex flex-col">
        
        <div className="p-6 border-b border-slate-100 bg-slate-50/20">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-snug">
            건의 사항 등록하기
          </h2>
        </div>

        {/* Submitting form body */}
        <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category select block */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">포럼 게시판 분류:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
              >
                <option value="[건의 게시판]">[건의 게시판]</option>
                <option value="[대양 건의]">[대양 건의]</option>
                <option value="[길드 소통]">[길드 소통]</option>
                <option value="[공지사항]">[공지사항]</option>
              </select>
            </div>

            {/* Character avatar select block */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">모험가 대표 가문 클래스:</label>
              <select
                value={newClassAvatar}
                onChange={(e) => setNewClassAvatar(e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
              >
                <option value="ranger">레인저</option>
                <option value="warrior">워리어</option>
                <option value="witch">위치</option>
                <option value="mystic">미스틱</option>
                <option value="ninja">닌자</option>
                <option value="sorceress">소서러</option>
                <option value="maegu">매구</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block">작성 가문명 명소:</label>
              <input
                type="text"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="자신의 가문명을 입력하세요."
                className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none font-semibold"
              />
            </div>

          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">제안 핵심 제목:</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="안건의 핵심 제안을 요약하여 제목을 작성하세요."
              className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">상세 건의 핵심 제의사항:</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={10}
              placeholder="현재 상황에 관한 고충, 그리고 구체적인 개선 방향성 아이디어를 소신 있게 기재해 주세요."
              className="w-full min-h-[250px] bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">연결 키워드 태그 (콤마로 구분):</label>
            <input
              type="text"
              value={newTagsString}
              onChange={(e) => setNewTagsString(e.target.value)}
              placeholder="예: #PVP, #생활, #편의성"
              className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-1.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 px-4 py-2 rounded-lg cursor-pointer transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold px-5 py-2 rounded-lg cursor-pointer transition"
            >
              제출 완료
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
