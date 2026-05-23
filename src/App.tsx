/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ThumbsUp, 
  Heart,
  MessageSquare, 
  Eye, 
  Search, 
  X, 
  Plus, 
  SlidersHorizontal, 
  Shield, 
  ChevronDown, 
  BookOpen, 
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { FeedbackItem, ProcessStatus, Comment } from './types';
import { INITIAL_FEEDBACK_ITEMS } from './seedData';

// Format count helper
const formatViews = (views: number): string => {
  if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K';
  }
  return views.toString();
};

export default function App() {
  // Load feedback items from LocalStorage or seed data
  const [items, setItems] = useState<FeedbackItem[]>(() => {
    const saved = localStorage.getItem('bdo_feedback_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_FEEDBACK_ITEMS;
  });

  // Current active status tab filter
  const [activeStatus, setActiveStatus] = useState<ProcessStatus>(ProcessStatus.ALL);
  
  // Sorting options
  type SortType = 'date' | 'views' | 'comments' | 'sympathy' | 'feedback_recent';
  const [sortType, setSortType] = useState<SortType>('feedback_recent');
  const [sortOrder, setSortOrder] = useState<boolean>(false); // false = DESC (default), true = ASC

  // Date duration filter (in days, 0 = All)
  const [duration, setDuration] = useState<number>(0);
  const [isDurationDropdownOpen, setIsDurationDropdownOpen] = useState<boolean>(false);

  // Search parameters
  const [searchType, setSearchType] = useState<string>('all'); // all, title, author
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Selected feedback item for detail modal
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);

  // GM Sandbox Mode toggle
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Form states for creating a new feedback post
  const [isWriteModalOpen, setIsWriteModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('[건의 게시판]');
  const [newAuthor, setNewAuthor] = useState<string>('모험가님');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newTagsString, setNewTagsString] = useState<string>('#편의성, #콘텐츠');
  const [newClassAvatar, setNewClassAvatar] = useState<string>('ranger');

  // Comment input state (for detail modal)
  const [commentAuthor, setCommentAuthor] = useState<string>('모험가');
  const [commentContent, setCommentContent] = useState<string>('');
  const [commentIsGM, setCommentIsGM] = useState<boolean>(false);

  // Dev reply edit panel state
  const [devReplyContent, setDevReplyContent] = useState<string>('');
  const [devReplyGM, setDevReplyGM] = useState<string>('[개발자 답변]');

  // Toast / System Alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning'>('success');

  // Sync back to local storage whenever items change
  useEffect(() => {
    localStorage.setItem('bdo_feedback_items', JSON.stringify(items));
  }, [items]);

  // Display Custom Toast
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync selected item with main items array
  const reactiveSelectedItem = useMemo(() => {
    if (!selectedItem) return null;
    return items.find(i => i.id === selectedItem.id) || selectedItem;
  }, [items, selectedItem]);

  // Reset database back to default seed data
  const handleResetDatabase = () => {
    if (window.confirm("피드백 데이터를 초기 상태로 리셋하시겠습니까? (추가된 글과 코멘트가 삭제됩니다.)")) {
      setItems(INITIAL_FEEDBACK_ITEMS);
      setSelectedItem(null);
      showToast("피드백 게시판 데이터가 성공적으로 리셋되었습니다.", "info");
    }
  };

  // Upvote/Sympathy action
  const toggleSympathy = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const alreadyVoted = item.voted;
        if (alreadyVoted === 'up') {
          showToast("공감을 취소했습니다.", "info");
          return {
            ...item,
            voted: null,
            sympathy: Math.max(0, item.sympathy - 1)
          };
        } else {
          showToast("해당 건의에 공감하였습니다! 의견에 힘을 더했습니다.", "success");
          return {
            ...item,
            voted: 'up',
            sympathy: item.sympathy + 1
          };
        }
      }
      return item;
    }));
  };

  // Delete a posting
  const deleteItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm("해당 피드백 건의를 영구적으로 삭제하시겠습니까?")) {
      setItems(prev => prev.filter(item => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      showToast("건의가 성공적으로 삭제되었습니다.", "warning");
    }
  };

  // Add a new comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reactiveSelectedItem) return;
    if (!commentContent.trim()) {
      showToast("댓글 내용을 입력해주세요.", "warning");
      return;
    }

    const newComment: Comment = {
      id: "comment-" + Date.now(),
      author: commentIsGM ? `[GM]${commentAuthor.replace('[GM]', '')}` : commentAuthor,
      isGM: commentIsGM || isAdminMode,
      content: commentContent,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setItems(prev => prev.map(item => {
      if (item.id === reactiveSelectedItem.id) {
        return {
          ...item,
          commentsCount: item.commentsCount + 1,
          comments: [...item.comments, newComment]
        };
      }
      return item;
    }));

    setCommentContent('');
    showToast("의견 댓글이 등록되었습니다.", "success");
  };

  // Delete a comment
  const handleDeleteComment = (commentId: string) => {
    if (!reactiveSelectedItem) return;
    
    setItems(prev => prev.map(item => {
      if (item.id === reactiveSelectedItem.id) {
        return {
          ...item,
          commentsCount: Math.max(0, item.commentsCount - 1),
          comments: item.comments.filter(c => c.id !== commentId)
        };
      }
      return item;
    }));
    showToast("댓글이 삭제되었습니다.", "info");
  };

  // Handle Developer/GM Answer Submission (Admin Sandbox)
  const handleSaveDevResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reactiveSelectedItem) return;

    setItems(prev => prev.map(item => {
      if (item.id === reactiveSelectedItem.id) {
        return {
          ...item,
          developerAnswer: devReplyContent.trim() ? {
            author: devReplyGM.trim() || "[개발자 답변]",
            content: devReplyContent,
            date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, '').slice(0, -1)
          } : null
        };
      }
      return item;
    }));

    showToast(devReplyContent.trim() ? "개발자 공식 답변이 등록되었습니다!" : "개발자 답변이 삭제되었습니다.", "success");
  };

  // Handle GM admin change of process status
  const handleAdminStatusChange = (id: string, newStatus: ProcessStatus) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus
        };
      }
      return item;
    }));
    showToast(`피드백 상태가 '${getStatusLabel(newStatus)}' 상태로 조율되었습니다.`, "success");
  };

  // Create new Feedback Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      showToast("제목과 건의 내용을 모두 채워넣어주세요.", "warning");
      return;
    }

    // Process tags
    const tagsArr = newTagsString.split(',')
      .map(tag => tag.trim())
      .map(tag => tag.startsWith('#') ? tag : '#' + tag)
      .filter(tag => tag.length > 1);

    const newItem: FeedbackItem = {
      id: (Date.now() % 1000000).toString(),
      type: 'normal',
      category: newCategory,
      title: newTitle,
      description: newDescription,
      author: newAuthor,
      isGM: isAdminMode,
      profileImg: getClassAvatarUrl(newClassAvatar),
      date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, '').slice(0, -1),
      views: 1,
      commentsCount: 0,
      comments: [],
      sympathy: 0,
      voted: null,
      tags: tagsArr.length > 0 ? tagsArr : ["#건의"],
      status: ProcessStatus.DISCUSSING,
      developerAnswer: null
    };

    setItems(prev => [newItem, ...prev]);
    setIsWriteModalOpen(false);
    
    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewTagsString('#편의성, #콘텐츠');
    
    showToast("새로운 건의 글이 피드백 게시판에 등록되었습니다!", "success");
  };

  // Fetch Class Avatars
  const getClassAvatarUrl = (cls: string): string => {
    const avatars: Record<string, string> = {
      ranger: "https://s1.pearlcdn.com/account/Upload/ProfileImage/20211/27/667d8898b7b20210127171133863",
      warrior: "https://s1.pearlcdn.com/account/Upload/ProfileImage/20211/27/efa86232f2a20210127171810078",
      witch: "https://s1.pearlcdn.com/account/Upload/ProfileImage/20213/23/575c9131d7a20210323050441770",
      mystic: "https://s1.pearlcdn.com/account/Upload/ProfileImage/20211/27/19b0652b96720210127171518806",
      ninja: "https://s1.pearlcdn.com/account/Upload/ProfileImage/20211/27/16ca18d1df220210127171328237",
      sorceress: "https://s1.pearlcdn.com/account/Upload/ProfileImage/20211/27/65cc2b2e05b20210127171547551",
      maegu: "https://s1.pearlcdn.com/account/Upload/ProfileImage/20231/13/4d37b5cfed020230113074258172.png"
    };
    return avatars[cls] || avatars.warrior;
  };

  // Duration Options helpers
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

  // Helper labels & colors for process status
  const getStatusLabel = (status: ProcessStatus) => {
    switch (status) {
      case ProcessStatus.DISCUSSING: return "논의중";
      case ProcessStatus.IN_PROGRESS: return "진행중";
      case ProcessStatus.APPLIED: return "적용 완료";
      case ProcessStatus.REVIEW_COMPLETE: return "검토 완료";
      case ProcessStatus.NONE: return "-";
      default: return "전체";
    }
  };

  const getStatusStyle = (status: ProcessStatus) => {
    switch (status) {
      case ProcessStatus.DISCUSSING:
        return {
          bg: "bg-orange-600",
          text: "text-white",
          border: "border-orange-700"
        };
      case ProcessStatus.IN_PROGRESS:
        return {
          bg: "bg-blue-600",
          text: "text-white",
          border: "border-blue-700"
        };
      case ProcessStatus.APPLIED:
        return {
          bg: "bg-emerald-600",
          text: "text-white",
          border: "border-emerald-700"
        };
      case ProcessStatus.REVIEW_COMPLETE:
        return {
          bg: "bg-slate-700",
          text: "text-white",
          border: "border-slate-800"
        };
      default:
        return {
          bg: "bg-slate-200",
          text: "text-slate-700",
          border: "border-slate-300"
        };
    }
  };

  // Prepare input search query trigger
  const triggerSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Count items stats for dashboard widget
  const statistics = useMemo(() => {
    const total = items.filter(i => i.type !== 'noti').length;
    const discussing = items.filter(i => i.status === ProcessStatus.DISCUSSING && i.type !== 'noti').length;
    const inProgress = items.filter(i => i.status === ProcessStatus.IN_PROGRESS && i.type !== 'noti').length;
    const applied = items.filter(i => i.status === ProcessStatus.APPLIED && i.type !== 'noti').length;
    const reviewComplete = items.filter(i => i.status === ProcessStatus.REVIEW_COMPLETE && i.type !== 'noti').length;
    return { total, discussing, inProgress, applied, reviewComplete };
  }, [items]);

  // Compute filtered items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // 1. Filter by top process status tab
    if (activeStatus !== ProcessStatus.ALL) {
      result = result.filter(item => item.status === activeStatus);
    }

    // 2. Filter by Date Duration
    if (duration > 0) {
      const now = new Date();
      result = result.filter(item => {
        const parts = item.date.split('.');
        if (parts.length === 3) {
          const itemYear = parseInt(parts[0], 10);
          const itemMonth = parseInt(parts[1], 10) - 1;
          const itemDay = parseInt(parts[2], 10);
          const itemDate = new Date(itemYear, itemMonth, itemDay);
          const diffTime = Math.abs(now.getTime() - itemDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= duration;
        }
        return true;
      });
    }

    // 3. Filter by text search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const descMatch = item.description.toLowerCase().includes(query);
        const authorMatch = item.author.toLowerCase().includes(query);
        const tagMatch = item.tags.some(tag => tag.toLowerCase().includes(query));

        if (searchType === 'title') {
          return titleMatch || descMatch || tagMatch;
        } else if (searchType === 'author') {
          return authorMatch;
        } else {
          return titleMatch || descMatch || authorMatch || tagMatch;
        }
      });
    }

    // 4. Sort results
    result.sort((a, b) => {
      // Keep announcement pinned at the very top
      if (a.type === 'noti' && b.type !== 'noti') return -1;
      if (b.type === 'noti' && a.type !== 'noti') return 1;

      let valueA: any;
      let valueB: any;

      switch (sortType) {
        case 'views':
          valueA = a.views;
          valueB = b.views;
          break;
        case 'comments':
          valueA = a.commentsCount;
          valueB = b.commentsCount;
          break;
        case 'sympathy':
          valueA = a.sympathy;
          valueB = b.sympathy;
          break;
        case 'date':
          valueA = a.date.replace(/\./g, '');
          valueB = b.date.replace(/\./g, '');
          break;
        case 'feedback_recent':
        default:
          valueA = parseInt(a.id);
          valueB = parseInt(b.id);
          break;
      }

      if (!sortOrder) {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      } else {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      }
    });

    return result;
  }, [items, activeStatus, duration, searchQuery, searchType, sortType, sortOrder]);

  // Compute pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  
  const paginatedItems = useMemo(() => {
    const page = Math.min(currentPage, totalPages);
    const startIndex = (page - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, totalPages]);

  // Reset page when search or duration filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus, duration, searchQuery, sortType]);

  // Setup initial state for Developer comments when a post is clicked
  const handleOpenItem = (item: FeedbackItem) => {
    setSelectedItem(item);
    
    // Auto increment views count
    setItems(prev => prev.map(i => {
      if (i.id === item.id) {
        return {
          ...i,
          views: i.views + 1
        };
      }
      return i;
    }));

    setDevReplyContent(item.developerAnswer?.content || '');
    setDevReplyGM(item.developerAnswer?.author || '[개발자 답변]');
  };

  return (
    <div id="bdo_board_app" className="min-h-screen bg-white text-slate-800 font-sans antialiased pb-20">
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded-lg shadow-lg transition-all duration-300 transform animate-fade-in text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-slate-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Content Wrap */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Simple crisp header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              피드백 게시판
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-4xl">
              검은사막 모험가님들의 소중한 목소리와 건의 방향성에 대해, 개발진이 직접 진행 현황 및 검토 기준을 투명하게 전해 드리는 소통 소 광단입니다.
            </p>
          </div>

          <button 
            id="btnWrite"
            onClick={() => setIsWriteModalOpen(true)}
            className="w-full md:w-auto inline-flex items-center justify-center bg-slate-950 hover:bg-slate-800 text-white px-4.5 py-2 rounded-lg font-semibold text-xs tracking-tight transition duration-150 shadow-sm gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>건의 등록하기</span>
          </button>
        </div>



        {/* Board Main List Interface */}
        <div className="space-y-4">
          
          {/* Filters, Timing, Status Sorters Panel */}
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
              paginatedItems.map((item) => {
                const statusStyle = getStatusStyle(item.status);
                
                return (
                  <div 
                    key={item.id}
                    onClick={() => handleOpenItem(item)}
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
                          onClick={(e) => toggleSympathy(item.id, e)}
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
                                onChange={(e) => handleAdminStatusChange(item.id, Number(e.target.value) as ProcessStatus)}
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
              })
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

          {/* Bottom Clean Search Controls */}
          <div className="max-w-xl mx-auto pt-6">
            <form onSubmit={triggerSearch} className="flex gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-350 transition-all">
              
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
                  onClick={clearSearch} 
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
                검색 조건: &apos;<span className="text-slate-800 font-semibold">{searchQuery}</span>&apos; 결과 {filteredItems.length}건
              </p>
            )}
          </div>

        </div>

        {/* Selected posting Detail Overlay Modal */}
        {selectedItem && reactiveSelectedItem && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs overflow-y-auto animate-fade-in">
            
            <div className="bg-white border border-slate-200 max-w-4xl w-full h-[90vh] overflow-hidden rounded-xl shadow-xl relative flex flex-col">
              
              {/* Header Info */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/20">
                
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-snug">
                  {reactiveSelectedItem.title}
                </h2>

                {/* Subinfo Metadata Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100/70 text-xs text-slate-500">
                  
                  <div className="flex items-center gap-2">
                    {reactiveSelectedItem.profileImg ? (
                      <img 
                        src={reactiveSelectedItem.profileImg} 
                        alt="" 
                        className="w-6.5 h-6.5 rounded-full object-cover border border-slate-100 bg-slate-50" 
                      />
                    ) : (
                      <div className="w-6.5 h-6.5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                        {reactiveSelectedItem.author.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className={`font-semibold text-xs ${reactiveSelectedItem.isGM ? 'text-slate-700' : 'text-slate-700'}`}>
                        {reactiveSelectedItem.author}
                      </p>
                      <span className="text-[9px] text-slate-400">등록일: {reactiveSelectedItem.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 bg-slate-150 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                      <ThumbsUp className="w-3.5 h-3.5 text-slate-500" />
                      <span>공감 {reactiveSelectedItem.sympathy}</span>
                    </span>
                    <span>조회 수 {reactiveSelectedItem.views}</span>
                    <span>의견 수 {reactiveSelectedItem.commentsCount}</span>
                    
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-md border ${
                      getStatusStyle(reactiveSelectedItem.status).bg
                    } ${getStatusStyle(reactiveSelectedItem.status).text} ${getStatusStyle(reactiveSelectedItem.status).border}`}>
                      {getStatusLabel(reactiveSelectedItem.status)}
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
                    {reactiveSelectedItem.description}
                  </p>
                </div>

                {/* Tag Pills */}
                {reactiveSelectedItem.tags && reactiveSelectedItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {reactiveSelectedItem.tags.map((t, index) => (
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
                {reactiveSelectedItem.developerAnswer ? (
                  <div className="bg-slate-50/70 border border-slate-100 p-5 rounded-xl relative overflow-hidden">

                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100/70">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {reactiveSelectedItem.developerAnswer.author}
                        </h4>
                        <span className="text-[9px] text-slate-400">등록일: {reactiveSelectedItem.developerAnswer.date}</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                      {reactiveSelectedItem.developerAnswer.content}
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
                            onClick={() => handleAdminStatusChange(reactiveSelectedItem.id, btn.status)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                              reactiveSelectedItem.status === btn.status
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
                    <form onSubmit={handleSaveDevResponse} className="space-y-2.5">
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
                          onClick={() => deleteItem(reactiveSelectedItem.id)}
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
                      <span>모험가 한마디 ({reactiveSelectedItem.comments.length})</span>
                    </h3>
                  </div>

                  {/* Comment list */}
                  {reactiveSelectedItem.comments.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 text-center text-xs text-slate-400">
                      등록된 모험가의 의견이 없습니다. 의견을 전하며 첫 교류를 가동해 보세요!
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {reactiveSelectedItem.comments.map((comment) => (
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
                                    onClick={() => handleDeleteComment(comment.id)} 
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
                  <form onSubmit={handleAddComment} className="bg-slate-50/50 border border-slate-200/80 p-3.5 rounded-xl space-y-2.5">
                    
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
                  onClick={() => toggleSympathy(reactiveSelectedItem.id)}
                  className={`flex items-center gap-1 text-xs font-bold rounded-lg border px-3.5 py-1.5 transition duration-150 cursor-pointer ${
                    reactiveSelectedItem.voted === 'up'
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-white text-rose-700 hover:bg-rose-50 border-rose-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${reactiveSelectedItem.voted === 'up' ? 'fill-current' : ''}`} />
                  <span className="text-[11px]">공감 ({reactiveSelectedItem.sympathy})</span>
                </button>

                <button 
                  onClick={() => setSelectedItem(null)}
                  className="bg-slate-905 hover:bg-slate-800 text-slate-700 hover:text-slate-900 border border-slate-350 rounded-lg text-xs font-bold px-4 py-1.5 transition cursor-pointer"
                >
                  목록으로 돌아가기
                </button>

              </div>

            </div>

          </div>
        )}

        {/* Create Proposal Modal Form */}
        {isWriteModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs overflow-y-auto animate-fade-in">
            
            <div className="bg-white border border-slate-200 max-w-4xl w-full max-h-[85vh] overflow-y-auto rounded-xl shadow-xl relative flex flex-col">
              
              <div className="p-6 border-b border-slate-100 bg-slate-50/20">
                <button 
                  onClick={() => setIsWriteModalOpen(false)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-snug">
                  건의 사항 등록하기
                </h2>
              </div>

              {/* Submitting form body */}
              <form onSubmit={handleCreatePost} className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
                
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
                    onClick={() => setIsWriteModalOpen(false)}
                    className="bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 px-4 py-2 rounded-lg cursor-pointer transition"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-lg cursor-pointer transition"
                  >
                    제출 완료
                  </button>
                </div>

              </form>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
