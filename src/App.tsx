import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useFeedback } from './hooks/useFeedback';
import { ProcessStatus } from './types/feedback';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { FeedbackCard } from './components/FeedbackCard';
import { SearchBar } from './components/SearchBar';
import { WriteModal } from './components/WriteModal';
import { DetailModal } from './components/DetailModal';
import { Toast } from './components/Toast';

export default function App() {
  const {
    activeStatus,
    setActiveStatus,
    sortType,
    setSortType,
    sortOrder,
    setSortOrder,
    duration,
    setDuration,
    isDurationDropdownOpen,
    setIsDurationDropdownOpen,
    searchType,
    setSearchType,
    searchInput,
    setSearchInput,
    searchQuery,
    triggerSearch,
    clearSearch,
    currentPage,
    setCurrentPage,
    totalPages,
    selectedItem,
    setSelectedItem,
    reactiveSelectedItem,
    isAdminMode,
    setIsAdminMode,
    isWriteModalOpen,
    setIsWriteModalOpen,
    
    // Write Form State
    newTitle,
    setNewTitle,
    newCategory,
    setNewCategory,
    newAuthor,
    setNewAuthor,
    newDescription,
    setNewDescription,
    newTagsString,
    setNewTagsString,
    newClassAvatar,
    setNewClassAvatar,
    
    // Comment Form State
    commentAuthor,
    setCommentAuthor,
    commentContent,
    setCommentContent,
    commentIsGM,
    setCommentIsGM,
    
    // Dev Response Edit State
    devReplyContent,
    setDevReplyContent,
    devReplyGM,
    setDevReplyGM,
    
    // Toast State
    toastMessage,
    
    // Actions
    handleResetDatabase,
    toggleSympathy,
    deleteItem,
    handleAddComment,
    handleDeleteComment,
    handleSaveDevResponse,
    handleAdminStatusChange,
    handleCreatePost,
    handleOpenItem,
    
    // Computed/Stats
    filteredItems,
    paginatedItems
  } = useFeedback();

  return (
    <div id="bdo_board_app" className="min-h-screen bg-white text-slate-800 font-sans antialiased pb-20">
      
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Primary Content Wrap */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Header Component */}
        <Header 
          onWriteClick={() => setIsWriteModalOpen(true)}
          isAdminMode={isAdminMode}
          setIsAdminMode={setIsAdminMode}
          onResetDatabase={handleResetDatabase}
        />

        {/* Board Main List Interface */}
        <div className="space-y-4">
          
          {/* Filter Bar Component */}
          <FilterBar 
            activeStatus={activeStatus}
            setActiveStatus={setActiveStatus}
            duration={duration}
            setDuration={setDuration}
            isDurationDropdownOpen={isDurationDropdownOpen}
            setIsDurationDropdownOpen={setIsDurationDropdownOpen}
            sortType={sortType}
            setSortType={setSortType}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />

          {/* Cards List Area */}
          <div className="space-y-2">
            {paginatedItems.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-xl p-12 text-center shadow-xs">
                <SlidersHorizontal className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-700 mb-1">일치하는 목록이 존재하지 않습니다.</h3>
                <p className="text-xs text-slate-400 mb-4">기간 설정 또는 입력 검색 조건을 변경해 보시기 바랍니다.</p>
                <button 
                  onClick={() => {
                    clearSearch();
                    setActiveStatus(ProcessStatus.ALL);
                    setDuration(0);
                  }}
                  className="text-xs text-slate-700 border border-slate-300 rounded px-3.5 py-1.5 hover:bg-slate-50 font-semibold transition cursor-pointer"
                >
                  모든 조건 초기화
                </button>
              </div>
            ) : (
              paginatedItems.map((item) => (
                <FeedbackCard 
                  key={item.id}
                  item={item}
                  isAdminMode={isAdminMode}
                  onCardClick={handleOpenItem}
                  onSympathyToggle={toggleSympathy}
                  onAdminStatusChange={handleAdminStatusChange}
                />
              ))
            )}
          </div>

          {/* Simple Clean Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 pt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 font-bold text-xs disabled:opacity-40 transition-opacity cursor-pointer"
              >
                이전
              </button>

              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 rounded-lg font-bold text-xs transition cursor-pointer ${
                      currentPage === pageNumber
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 font-bold text-xs disabled:opacity-40 transition-opacity cursor-pointer"
              >
                다음
              </button>
            </div>
          )}

          {/* Search Bar Component */}
          <SearchBar 
            searchType={searchType}
            setSearchType={setSearchType}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            searchQuery={searchQuery}
            onSearchSubmit={triggerSearch}
            onClearSearch={clearSearch}
            filteredItemsCount={filteredItems.length}
          />

        </div>

        {/* Detail Modal Component */}
        {selectedItem && reactiveSelectedItem && (
          <DetailModal 
            item={reactiveSelectedItem}
            isAdminMode={isAdminMode}
            onClose={() => setSelectedItem(null)}
            onSympathyToggle={toggleSympathy}
            onAdminStatusChange={handleAdminStatusChange}
            onDeleteItem={deleteItem}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            onSaveDevResponse={handleSaveDevResponse}
            
            // Comment Form
            commentAuthor={commentAuthor}
            setCommentAuthor={setCommentAuthor}
            commentContent={commentContent}
            setCommentContent={setCommentContent}
            commentIsGM={commentIsGM}
            setCommentIsGM={setCommentIsGM}
            
            // Dev Reply
            devReplyContent={devReplyContent}
            setDevReplyContent={setDevReplyContent}
            devReplyGM={devReplyGM}
            setDevReplyGM={setDevReplyGM}
          />
        )}

        {/* Write Modal Component */}
        <WriteModal 
          isOpen={isWriteModalOpen}
          onClose={() => setIsWriteModalOpen(false)}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          newClassAvatar={newClassAvatar}
          setNewClassAvatar={setNewClassAvatar}
          newAuthor={newAuthor}
          setNewAuthor={setNewAuthor}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          newDescription={newDescription}
          setNewDescription={setNewDescription}
          newTagsString={newTagsString}
          setNewTagsString={setNewTagsString}
          onSubmit={handleCreatePost}
        />

      </main>

    </div>
  );
}
