import React from 'react';
import { X, ThumbsUp, Heart, MessageSquare, BookOpen, AlertTriangle, Shield } from 'lucide-react';
import { FeedbackItem, ProcessStatus } from '../types/feedback';
import { getStatusLabel, getStatusStyle } from '../hooks/useFeedback';

interface DetailModalProps {
  item: FeedbackItem;
  isAdminMode: boolean;
  onClose: () => void;
  onSympathyToggle: (id: string, e?: React.MouseEvent) => void;
  onAdminStatusChange: (id: string, newStatus: ProcessStatus) => void;
  onDeleteItem: (id: string) => void;
  onAddComment: (e: React.FormEvent) => void;
  onDeleteComment: (commentId: string) => void;
  onSaveDevResponse: (e: React.FormEvent) => void;
  
  // Comment states
  commentAuthor: string;
  setCommentAuthor: (val: string) => void;
  commentContent: string;
  setCommentContent: (val: string) => void;
  commentIsGM: boolean;
  setCommentIsGM: (val: boolean) => void;
  
  // Dev Reply states
  devReplyContent: string;
  setDevReplyContent: (val: string) => void;
  devReplyGM: string;
  setDevReplyGM: (val: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  isAdminMode,
  onClose,
  onSympathyToggle,
  onAdminStatusChange,
  onDeleteItem,
  onAddComment,
  onDeleteComment,
  onSaveDevResponse,
  commentAuthor,
  setCommentAuthor,
  commentContent,
  setCommentContent,
  commentIsGM,
  setCommentIsGM,
  devReplyContent,
  setDevReplyContent,
  devReplyGM,
  setDevReplyGM
}) => {
  const statusStyle = getStatusStyle(item.status);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs overflow-y-auto animate-fade-in">
      
      <div className="bg-white border border-slate-200 max-w-4xl w-full h-[90vh] overflow-hidden rounded-xl shadow-xl relative flex flex-col">
        
        {/* Header Info */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/20">
          
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-snug">
            {item.title}
          </h2>

          {/* Subinfo Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100/70 text-xs text-slate-500">
            
            <div className="flex items-center gap-2">
              {item.profileImg ? (
                <img 
                  src={item.profileImg} 
                  alt="" 
                  className="w-6.5 h-6.5 rounded-full object-cover border border-slate-100 bg-slate-50" 
                />
              ) : (
                <div className="w-6.5 h-6.5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                  {item.author.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-xs text-slate-700">
                  {item.author}
                </p>
                <span className="text-[9px] text-slate-400">등록일: {item.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 bg-slate-150 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                <ThumbsUp className="w-3.5 h-3.5 text-slate-500" />
                <span>공감 {item.sympathy}</span>
              </span>
              <span>조회 수 {item.views}</span>
              <span>의견 수 {item.commentsCount}</span>
              
              <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-md border ${
                statusStyle.bg
              } ${statusStyle.text} ${statusStyle.border}`}>
                {getStatusLabel(item.status)}
              </span>
            </div>

          </div>

        </div>

        {/* Main Content Body */}
        <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
          
          {/* Proposal Text Card */}
          <div className="bg-slate-50/40 p-5 border border-slate-150/70 rounded-xl">
            <div className="flex items-center gap-2 mb-3 text-xs text-slate-500 font-semibold border-b border-slate-100 pb-2">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>모험가 건의내용 상세</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
              {item.description}
            </p>
          </div>

          {/* Tag Pills */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((t, index) => (
                <span 
                  key={index} 
                  className="bg-slate-50 text-slate-600 text-xs px-2.5 py-1 font-semibold rounded-lg border border-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Developer Answer Panel */}
          {item.developerAnswer ? (
            <div className="bg-slate-50/70 border border-slate-100 p-5 rounded-xl relative overflow-hidden">

              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100/70">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {item.developerAnswer.author}
                  </h4>
                  <span className="text-[9px] text-slate-400">등록일: {item.developerAnswer.date}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {item.developerAnswer.content}
              </p>

            </div>
          ) : (
            isAdminMode && (
              <div className="bg-slate-50 border border-slate-200 p-4 text-center rounded-xl">
                <AlertTriangle className="w-4 h-4 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-600">
                  이 안건에 등록된 공식 피드백이 없습니다.
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  우측 GM 관리 자 구역에서 개발진 대행 답변을 작성하여 적용해 보실 수 있습니다.
                </p>
              </div>
            )
          )}

          {/* Sandbox Control Deck Panels */}
          {isAdminMode && (
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
              
              <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                <Shield className="w-4 h-4 text-slate-600" />
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                  GM Sandbox Control Deck
                </h4>
              </div>

              {/* Quick state changes */}
              <div className="flex flex-col sm:flex-row items-baseline gap-2">
                <span className="text-xs font-bold text-slate-700">1. 건의 진행 상태 조율:</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { lbl: "논의중", status: ProcessStatus.DISCUSSING },
                    { lbl: "진행중", status: ProcessStatus.IN_PROGRESS },
                    { lbl: "적용 완료", status: ProcessStatus.APPLIED },
                    { lbl: "검토 완료", status: ProcessStatus.REVIEW_COMPLETE }
                  ].map((btn) => (
                    <button
                      key={btn.status}
                      type="button"
                      onClick={() => onAdminStatusChange(item.id, btn.status)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                        item.status === btn.status
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      {btn.lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Developer Answer formulation */}
              <form onSubmit={onSaveDevResponse} className="space-y-2.5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    2. 답변 작성 (지우고 서명을 넣으면 내용이 삭제처리됩니다):
                  </label>
                  <input 
                    type="text" 
                    value={devReplyGM}
                    onChange={(e) => setDevReplyGM(e.target.value)}
                    placeholder="작성자 서명"
                    className="bg-white border rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none w-48 text-right font-semibold"
                  />
                </div>
                <textarea
                  value={devReplyContent}
                  onChange={(e) => setDevReplyContent(e.target.value)}
                  rows={4}
                  placeholder="이곳에 공식 피드백 타당성, 향후 업데이트 방향성을 적고 등록하세요..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none"
                />
                <div className="text-right flex justify-between">
                  <button 
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-700 text-xs px-3 py-1.5 border border-red-200 rounded-lg font-bold transition cursor-pointer"
                  >
                    건의글 삭제
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-1.5 rounded-lg font-semibold transition cursor-pointer"
                  >
                    대변서 적용하기
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Comment Portion */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-850 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <span>모험가 한마디 ({item.comments.length})</span>
              </h3>
            </div>

            {/* Comment list */}
            {item.comments.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 text-center text-xs text-slate-400">
                등록된 모험가의 의견이 없습니다. 의견을 전하며 첫 교류를 가동해 보세요!
              </div>
            ) : (
              <div className="space-y-2.5">
                {item.comments.map((comment) => (
                  <div key={comment.id} className="bg-slate-50 p-3 border border-slate-100 rounded-lg transition flex gap-2.5">
                    
                    <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] ${
                      comment.isGM 
                        ? 'bg-slate-900 text-white border border-slate-850' 
                        : 'bg-slate-200 text-slate-600 border border-slate-300'
                    }`}>
                      {comment.isGM ? 'GM' : comment.author.charAt(0)}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold ${comment.isGM ? 'text-slate-700' : 'text-slate-850'}`}>
                          {comment.author}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-slate-400">{comment.date}</span>
                          {(isAdminMode || comment.author === commentAuthor) && (
                            <button 
                              onClick={() => onDeleteComment(comment.id)} 
                              className="text-red-400 hover:text-red-700 font-bold text-[10px] transition-colors cursor-pointer"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap font-medium">
                        {comment.content}
                      </p>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Comment Inputs form */}
            <form onSubmit={onAddComment} className="bg-slate-50/50 border border-slate-200/80 p-3.5 rounded-xl space-y-2.5">
              
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] font-bold text-slate-550">가문명:</label>
                  <input
                    type="text"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    placeholder="모험가 가문명"
                    className="bg-white border rounded px-2 py-0.5 text-xs text-slate-850 font-semibold"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    id="chk_gm_comment"
                    checked={commentIsGM}
                    onChange={(e) => setCommentIsGM(e.target.checked)}
                    className="rounded border-slate-350 text-slate-800 w-3 h-3"
                  />
                  <label htmlFor="chk_gm_comment" className="text-[10px] font-semibold text-slate-600 cursor-pointer">
                    GM 답변 권한 적용
                  </label>
                </div>
              </div>

              <div className="flex gap-1.5">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={2}
                  placeholder="상습적인 비난이나 게임 욕설은 운영 위반으로 검열될 수 있습니다. 따뜻하고 건설적인 방향성을 전해 주시길 부탁드립니다."
                  className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg px-3.5 py-2 flex items-center justify-center cursor-pointer transition"
                >
                  등록
                </button>
              </div>

            </form>

          </div>

        </div>

        {/* Back actions Box */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/20 flex justify-between items-center">
          
          <button
            type="button"
            onClick={(e) => onSympathyToggle(item.id, e)}
            className={`flex items-center gap-1 text-xs font-bold rounded-lg border px-3.5 py-1.5 transition duration-150 cursor-pointer ${
              item.voted === 'up'
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-white text-rose-700 hover:bg-rose-50 border-rose-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${item.voted === 'up' ? 'fill-current' : ''}`} />
            <span className="text-[11px]">공감 ({item.sympathy})</span>
          </button>

          <button 
            onClick={onClose}
            className="bg-slate-905 hover:bg-slate-800 text-slate-700 hover:text-slate-900 border border-slate-350 rounded-lg text-xs font-bold px-4 py-1.5 transition cursor-pointer"
          >
            목록으로 돌아가기
          </button>

        </div>

      </div>

    </div>
  );
};
