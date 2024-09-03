import { FetchComponentRef } from '@repo/stream'

export interface StreamComponentRef extends FetchComponentRef {
  start: (sse_key: string) => void
}

export enum ErrorCode {
  sseKeyError = 400500,
  timeout = 400501,
  reject = 400502,
}
// 消息状态
export enum AskMessageStatus {
  Loading = 'loading',
  /** 正在流式中 */
  Processing = 'processing',
  Sending = 'sending',
  Resending = 'resending',
  Completed = 'completed',
  Failed = 'failed',
  Default = '',
}

// 评价
export enum FeedbackStatus {
  Unhelpful = 'unhelpful',
  Helpful = 'helpful',
  None = '',
}
export interface HistoryMessageItem {
  id: number
  create_time?: number
  update_time?: number
  conversation_id: string
  content: string
  is_reject?: boolean
  reply_content?: string
  status: AskMessageStatus
  feedback: FeedbackStatus
  sse_key?: string
}

export interface DataType {
  data: {
    id: string
    content: string
    finish: boolean
  }
  code: number
  msg: string
}
