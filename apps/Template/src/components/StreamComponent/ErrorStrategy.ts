import { type SetStateAction } from 'react'

import { AskMessageStatus, ErrorCode, type HistoryMessageItem } from '../../type'

interface ErrorStrategy {
  handle(history: HistoryMessageItem[]): HistoryMessageItem[]
}

// 展示消息的错误--不显示resend, 显示错误提示
class ShowMessageErrorStrategy implements ErrorStrategy {
  reply_content: string
  constructor({ reply_content }: { reply_content: string }) {
    this.reply_content = reply_content
  }
  handle(history: HistoryMessageItem[]): HistoryMessageItem[] {
    const lastItem = history.splice(-1, 1)[0]
    lastItem.reply_content = this.reply_content
    lastItem.status = AskMessageStatus.Completed
    return [...history, lastItem]
  }
}

// 拒答--不显示resend
class RejectStrategy extends ShowMessageErrorStrategy {
  constructor() {
    super({ reply_content: '很抱歉，这个问题我暂时无法回答。请尝试发送其他问题。' })
  }
}

// 超时--不显示resend
class TimeoutStrategy extends ShowMessageErrorStrategy {
  constructor() {
    super({ reply_content: '回复超时啦, 请退出重试!' })
  }
}
// SSEkey错误--不显示resend
class SseKeyErrorStrategy extends ShowMessageErrorStrategy {
  constructor() {
    super({ reply_content: 'SSE KEY 错误, 请刷新重试!' })
  }
}

// 通用错误--显示resend, 不显示错误提示
class DefaultErrorStrategy implements ErrorStrategy {
  handle(history: HistoryMessageItem[]): HistoryMessageItem[] {
    const lastItem = history.splice(-1, 1)[0]
    lastItem.reply_content = ''
    lastItem.status = AskMessageStatus.Failed
    return [...history, lastItem]
  }
}

const errorStrategyMap: Record<ErrorCode, ErrorStrategy> = {
  [ErrorCode.reject]: new RejectStrategy(),
  [ErrorCode.sseKeyError]: new SseKeyErrorStrategy(),
  [ErrorCode.timeout]: new TimeoutStrategy(),
  // 其他错误码映射到相应的策略
}

class ErrorHandler {
  private strategy: ErrorStrategy
  private action: (value: SetStateAction<HistoryMessageItem[]>) => void

  constructor({ code, action }: { code: ErrorCode; action: (value: SetStateAction<HistoryMessageItem[]>) => void }) {
    this.strategy = errorStrategyMap[code] || new DefaultErrorStrategy()
    this.action = action
  }

  handle() {
    this.action((history) => {
      return this.strategy.handle(history)
    })
  }
}

export const handleError = (code: ErrorCode, setHistory: (value: SetStateAction<HistoryMessageItem[]>) => void) => {
  const handler = new ErrorHandler({
    code,
    action: setHistory,
  })
  handler.handle()
}
