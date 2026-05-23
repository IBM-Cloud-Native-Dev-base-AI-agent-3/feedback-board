import React from 'react';
import { X, Search } from 'lucide-react';

interface SearchBarProps {
  searchType: string;
  setSearchType: (type: string) => void;
  searchInput: string;
  setSearchInput: (input: string) => void;
  searchQuery: string;
  onSearchSubmit: (e?: React.FormEvent) => void;
  onClearSearch: () => void;
  filteredItemsCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchType,
  setSearchType,
  searchInput,
  setSearchInput,
  searchQuery,
  onSearchSubmit,
  onClearSearch,
  filteredItemsCount
}) => {
  return (
    <div className="max-w-xl mx-auto pt-6">
      <form 
        onSubmit={onSearchSubmit} 
        className="flex gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-350 transition-all"
      >
        <select 
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="bg-transparent border-0 text-xs font-semibold px-2 cursor-pointer focus:ring-0 text-slate-700 focus:outline-none"
        >
          <option value="all">제목+내용</option>
          <option value="title">제목</option>
          <option value="author">작성자</option>
        </select>

        <div className="h-4 w-[1px] bg-slate-200 self-center" />

        <input 
          type="text" 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="검색어를 입력해 주세요." 
          className="flex-1 bg-transparent border-0 focus:ring-0 text-xs text-slate-800 outline-none px-2 focus:outline-none"
        />

        {searchInput && (
          <button 
            type="button" 
            onClick={onClearSearch} 
            className="p-1 hover:bg-slate-100 rounded text-slate-400 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button 
          type="submit"
          className="bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-lg px-3.5 py-1.5 flex items-center gap-1 cursor-pointer transition"
        >
          <Search className="w-3.5 h-3.5" />
          <span>검색</span>
        </button>
      </form>

      {searchQuery && (
        <p className="text-center text-[11px] text-slate-400 mt-2.5">
          검색 조건: &apos;<span className="text-slate-800 font-semibold">{searchQuery}</span>&apos; 결과 {filteredItemsCount}건
        </p>
      )}
    </div>
  );
};
