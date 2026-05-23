/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ProcessStatus {
  ALL = 99,
  DISCUSSING = 1,
  IN_PROGRESS = 2,
  APPLIED = 3,
  REVIEW_COMPLETE = 4,
  NONE = 0
}

export interface Comment {
  id: string;
  author: string;
  isGM: boolean;
  content: string;
  date: string;
}

export interface FeedbackItem {
  id: string; // matches topicNo / visitNo
  type: 'noti' | 'normal';
  category: string; // e.g. '[건의 게시판]'
  title: string;
  description: string;
  author: string;
  isGM: boolean;
  profileImg?: string;
  date: string;
  views: number;
  commentsCount: number;
  comments: Comment[];
  sympathy: number;
  voted?: 'up' | 'down' | null;
  tags: string[];
  status: ProcessStatus;
  developerAnswer?: {
    author: string;
    content: string;
    date: string;
  } | null;
}
