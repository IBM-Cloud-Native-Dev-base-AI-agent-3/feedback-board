import React, { useState, useEffect, useMemo } from 'react';
import { FeedbackItem, ProcessStatus, Comment, User } from '../types/feedback';
import { supabase } from '../services/supabaseClient';

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
    default: return "알 수 없음";
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

const formatDateString = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
};

const mapDbItemToFeedback = (dbItem: any): FeedbackItem => {
  const authorInfo = dbItem.author || { username: dbItem.author_username, is_gm: false };
  return {
    id: dbItem.id,
    type: dbItem.type,
    title: dbItem.title,
    description: dbItem.description,
    author: authorInfo.username,
    isGM: authorInfo.is_gm,
    profileImg: authorInfo.profile_img,
    date: formatDateString(dbItem.created_at),
    views: dbItem.views || 0,
    commentsCount: dbItem.comments_count || 0,
    sympathy: dbItem.sympathy || 0,
    voted: null, // Will be computed after matching with user sympathy votes
    tags: dbItem.tags || [],
    status: dbItem.status as ProcessStatus,
    developerAnswer: dbItem.dev_answer_content ? {
      author: dbItem.dev_answer_author || '[개발자 답변]',
      content: dbItem.dev_answer_content,
      date: dbItem.dev_answer_date || ''
    } : null,
    comments: (dbItem.comments || []).map((c: any) => {
      const commentAuthorInfo = c.author || { username: c.author_username, is_gm: false };
      return {
        id: c.id,
        author: commentAuthorInfo.username,
        isGM: commentAuthorInfo.is_gm,
        content: c.content,
        date: c.created_at ? c.created_at.substring(0, 16).replace('T', ' ') : ''
      };
    })
  };
};

export function useFeedback() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Simulated Login States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);

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

  // Form states for creating a new feedback post
  const [isWriteModalOpen, setIsWriteModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newAuthor, setNewAuthor] = useState<string>('모험가님');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newTagsString, setNewTagsString] = useState<string>('#편의성, #콘텐츠');

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

  // Compute isAdminMode based on currentUser's role
  const isAdminMode = useMemo(() => {
    return currentUser?.is_gm || false;
  }, [currentUser]);

  // Display Custom Toast
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Fetch Users List
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('username');
      
      if (error) throw error;
      
      if (data) {
        setUsersList(data);
        if (data.length > 0 && !currentUser) {
          // Default to the first user in list
          setCurrentUser(data[0]);
          setCommentAuthor(data[0].username);
          setCommentIsGM(data[0].is_gm);
        }
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Fetch Feedback Items and Comments
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const { data: dbItems, error: itemsError } = await supabase
        .from('feedback_items')
        .select(`
          *,
          author:users!feedback_items_author_username_fkey (
            username,
            is_gm,
            profile_img
          ),
          comments (
            *,
            author:users!comments_author_username_fkey (
              username,
              is_gm,
              profile_img
            )
          )
        `);

      if (itemsError) throw itemsError;

      // Fetch empathy votes for the current logged-in user
      let votedIds = new Set<string>();
      if (currentUser) {
        const { data: votesData } = await supabase
          .from('sympathy_votes')
          .select('feedback_id')
          .eq('username', currentUser.username);
        if (votesData) {
          votedIds = new Set(votesData.map(v => v.feedback_id));
        }
      }

      const mapped = (dbItems || []).map(item => {
        const mappedItem = mapDbItemToFeedback(item);
        mappedItem.voted = votedIds.has(item.id) ? 'up' : null;
        return mappedItem;
      });

      setItems(mapped);
    } catch (err) {
      console.error("Error fetching feedback items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch items when user changes
  useEffect(() => {
    if (usersList.length > 0) {
      fetchItems();
    }
  }, [currentUser, usersList]);

  // Handle Simulated User Login Change
  const onUserChange = (username: string) => {
    const user = usersList.find(u => u.username === username);
    if (user) {
      setCurrentUser(user);
      setCommentAuthor(user.username);
      setCommentIsGM(user.is_gm);
      showToast(`'${user.username}' 가문으로 접속했습니다.`, "info");
    }
  };

  // Sync selected item with main items array
  const reactiveSelectedItem = useMemo(() => {
    if (!selectedItem) return null;
    return items.find(i => i.id === selectedItem.id) || selectedItem;
  }, [items, selectedItem]);


  // Upvote/Sympathy action
  const toggleSympathy = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      showToast("가문을 선택해 주세요.", "warning");
      return;
    }

    const item = items.find(i => i.id === id);
    if (!item) return;

    const alreadyVoted = item.voted === 'up';

    try {
      if (alreadyVoted) {
        // Delete vote row
        const { error: delError } = await supabase
          .from('sympathy_votes')
          .delete()
          .eq('feedback_id', id)
          .eq('username', currentUser.username);

        if (delError) throw delError;

        // Decrement sympathy count
        await supabase
          .from('feedback_items')
          .update({ sympathy: Math.max(0, item.sympathy - 1) })
          .eq('id', id);

        showToast("공감을 취소했습니다.", "info");
      } else {
        // Insert vote row
        const { error: insError } = await supabase
          .from('sympathy_votes')
          .insert({ feedback_id: id, username: currentUser.username });

        if (insError) throw insError;

        // Increment sympathy count
        await supabase
          .from('feedback_items')
          .update({ sympathy: item.sympathy + 1 })
          .eq('id', id);

        showToast("해당 건의에 공감하였습니다! 의견에 힘을 더했습니다.", "success");
      }
      await fetchItems();
    } catch (err) {
      console.error("Error updating sympathy votes:", err);
    }
  };

  // Delete a posting
  const deleteItem = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm("해당 피드백 건의를 영구적으로 삭제하시겠습니까?")) {
      try {
        const { error } = await supabase
          .from('feedback_items')
          .delete()
          .eq('id', id);

        if (error) throw error;

        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
        showToast("건의가 성공적으로 삭제되었습니다.", "warning");
        await fetchItems();
      } catch (err) {
        console.error("Error deleting proposal:", err);
        showToast("삭제 중 오류가 발생했습니다.", "warning");
      }
    }
  };

  // Add a new comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reactiveSelectedItem) return;
    if (!commentContent.trim()) {
      showToast("댓글 내용을 입력해주세요.", "warning");
      return;
    }
    if (!currentUser) {
      showToast("가문을 선택해 주세요.", "warning");
      return;
    }

    try {
      const newCommentId = "comment-" + Date.now();
      const { error: commentError } = await supabase
        .from('comments')
        .insert({
          id: newCommentId,
          feedback_id: reactiveSelectedItem.id,
          author_username: currentUser.username,
          content: commentContent
        });

      if (commentError) throw commentError;

      // Update feedback_items comments count
      await supabase
        .from('feedback_items')
        .update({ comments_count: reactiveSelectedItem.commentsCount + 1 })
        .eq('id', reactiveSelectedItem.id);

      setCommentContent('');
      showToast("의견 댓글이 등록되었습니다.", "success");
      await fetchItems();
    } catch (err) {
      console.error("Error inserting comment:", err);
      showToast("댓글 등록 실패했습니다.", "warning");
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!reactiveSelectedItem) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Decrement feedback comments count
      await supabase
        .from('feedback_items')
        .update({ comments_count: Math.max(0, reactiveSelectedItem.commentsCount - 1) })
        .eq('id', reactiveSelectedItem.id);

      showToast("댓글이 삭제되었습니다.", "info");
      await fetchItems();
    } catch (err) {
      console.error("Error deleting comment:", err);
      showToast("댓글 삭제 실패했습니다.", "warning");
    }
  };

  // Handle Developer/GM Answer Submission (Admin Sandbox)
  const handleSaveDevResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reactiveSelectedItem) return;

    const hasContent = devReplyContent.trim().length > 0;
    const newAnswerData = hasContent ? {
      dev_answer_author: devReplyGM.trim() || "[개발자 답변]",
      dev_answer_content: devReplyContent,
      dev_answer_date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, '').slice(0, -1)
    } : {
      dev_answer_author: null,
      dev_answer_content: null,
      dev_answer_date: null
    };

    try {
      const { error } = await supabase
        .from('feedback_items')
        .update(newAnswerData)
        .eq('id', reactiveSelectedItem.id);

      if (error) throw error;

      showToast(hasContent ? "개발자 공식 답변이 등록되었습니다!" : "개발자 답변이 삭제되었습니다.", "success");
      await fetchItems();
    } catch (err) {
      console.error("Error saving developer response:", err);
      showToast("답변 저장 중 실패했습니다.", "warning");
    }
  };

  // Handle GM admin change of process status
  const handleAdminStatusChange = async (id: string, newStatus: ProcessStatus) => {
    try {
      const { error } = await supabase
        .from('feedback_items')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      showToast(`피드백 상태가 '${getStatusLabel(newStatus)}' 상태로 조율되었습니다.`, "success");
      await fetchItems();
    } catch (err) {
      console.error("Error updating feedback status:", err);
      showToast("상태 변경 중 오류가 발생했습니다.", "warning");
    }
  };

  // Create new Feedback Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      showToast("제목과 건의 내용을 모두 채워넣어주세요.", "warning");
      return;
    }
    if (!currentUser) {
      showToast("가문을 선택해 주세요.", "warning");
      return;
    }

    // Process tags
    const tagsArr = newTagsString.split(',')
      .map(tag => tag.trim())
      .map(tag => tag.startsWith('#') ? tag : '#' + tag)
      .filter(tag => tag.length > 1);

    const newPostId = (Date.now() % 1000000).toString();

    try {
      const { error } = await supabase
        .from('feedback_items')
        .insert({
          id: newPostId,
          type: 'normal',
          title: newTitle,
          description: newDescription,
          author_username: currentUser.username,
          views: 1,
          comments_count: 0,
          tags: tagsArr.length > 0 ? tagsArr : ["#건의"],
          status: ProcessStatus.DISCUSSING,
          sympathy: 0
        });

      if (error) throw error;

      setIsWriteModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewTagsString('#편의성, #콘텐츠');
      showToast("새로운 건의 글이 피드백 게시판에 등록되었습니다!", "success");
      await fetchItems();
    } catch (err) {
      console.error("Error creating post:", err);
      showToast("건의 글 등록에 실패했습니다.", "warning");
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
  const handleOpenItem = async (item: FeedbackItem) => {
    setSelectedItem(item);
    setDevReplyContent(item.developerAnswer?.content || '');
    setDevReplyGM(item.developerAnswer?.author || '[개발자 답변]');

    try {
      // Auto increment views count in Supabase
      const { error } = await supabase
        .from('feedback_items')
        .update({ views: item.views + 1 })
        .eq('id', item.id);
      
      if (error) throw error;
      await fetchItems();
    } catch (err) {
      console.error("Error incrementing view count:", err);
    }
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
    isWriteModalOpen,
    setIsWriteModalOpen,
    isLoading,
    
    // Simulated User Login
    currentUser,
    usersList,
    onUserChange,

    // Write Form State
    newTitle,
    setNewTitle,
    newAuthor,
    setNewAuthor,
    newDescription,
    setNewDescription,
    newTagsString,
    setNewTagsString,
    
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
