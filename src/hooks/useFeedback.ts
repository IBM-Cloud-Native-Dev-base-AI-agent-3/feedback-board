import React, { useState, useEffect, useMemo } from 'react';
import { FeedbackItem, ProcessStatus, Comment } from '../types';
import { INITIAL_FEEDBACK_ITEMS } from '../seedData';

// Format count helper
export const formatViews = (views: number): string => {
  if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K';
  }
  return views.toString();
};

export const getClassAvatarUrl = (cls: string): string => {
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

export const getStatusLabel = (status: ProcessStatus) => {
  switch (status) {
    case ProcessStatus.DISCUSSING: return "논의중";
    case ProcessStatus.IN_PROGRESS: return "진행중";
    case ProcessStatus.APPLIED: return "적용 완료";
    case ProcessStatus.REVIEW_COMPLETE: return "검토 완료";
    case ProcessStatus.NONE: return "-";
    default: return "전체";
  }
};

export const getStatusStyle = (status: ProcessStatus) => {
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

export type SortType = 'date' | 'views' | 'comments' | 'sympathy' | 'feedback_recent';

export function useFeedback() {
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

  return {
    items,
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
    toastType,
    showToast,
    
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
    statistics,
    filteredItems,
    paginatedItems
  };
}
