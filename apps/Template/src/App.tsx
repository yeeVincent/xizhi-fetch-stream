import styles from './App.module.scss'
import classNames from 'classnames'
import { Fragment } from 'react/jsx-runtime'
import { Button, Divider, Modal } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useRef, useState } from 'react'
import StreamComponent from './components/StreamComponent'
import { AskMessageStatus, FeedbackStatus, HistoryMessageItem, StreamComponentRef } from './type'

export const App = () => {
  const [history, setHistory] = useState<HistoryMessageItem[]>([])
  const scrollDomRef = useRef<HTMLDivElement>(null)
  const [text, setText] = useState('')
  const streamComponentRef = useRef<StreamComponentRef>(null)

  const handleScrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollDomRef.current) {
      // dom更新是异步的, 所以需要等待dom更新完成后再滚动
      requestAnimationFrame(() => {
        scrollDomRef.current?.scrollTo({
          behavior,
          top: scrollDomRef.current.scrollHeight,
        })
      })
    }
  }

  const fetchSSE = (sse_key: string) => {
    streamComponentRef.current?.start(sse_key)
  }

  async function sendMessage() {
    if (!text.trim()) return
    const customId = history.length + 1
    setHistory((pre) => {
      return [
        ...pre,
        {
          id: customId,
          content: text,
          feedback: FeedbackStatus.None,
          conversation_id: '1',
          status: AskMessageStatus.Processing,
        },
      ]
    })
    setText('')
    fetchSSE('sse_key')
    handleScrollToBottom()
  }
  return (
    <>
      <Modal
        classNames={{
          content: classNames(styles.askModalContent),
        }}
        className={classNames(styles.askModal)}
        footer={null}
        closable={false}
        maskClosable={false}
        centered
        title='对话框, 快来和我聊天吧~啦啦啦'
        open={true}>
        <div className={styles.askWrapper}>
          <Divider style={{ marginTop: 0, marginBottom: 4 }} />
          <div className={styles.askWrapperInner}>
            <div className={classNames(styles.messageWrapper)} ref={scrollDomRef}>
              {history.map((item) => {
                return (
                  <Fragment key={item.id}>
                    <div className={classNames(styles.meContainer)}>
                      <span className={styles.me}>{item.content}</span>
                    </div>
                    {item.reply_content && (
                      <div className={classNames(styles.opContainer)}>
                        <div>
                          <span className={styles.op}>{item.reply_content}</span>
                        </div>
                      </div>
                    )}
                    {!item.reply_content &&
                      (item.status === AskMessageStatus.Processing || item.status === AskMessageStatus.Sending) && (
                        <StreamComponent
                          ref={streamComponentRef}
                          setHistory={setHistory}
                          handleScrollToBottom={handleScrollToBottom}></StreamComponent>
                      )}
                  </Fragment>
                )
              })}
            </div>
            <div className={styles.textAreaContainer}>
              <TextArea
                placeholder='输入点什么吧...'
                autoSize={{ minRows: 2, maxRows: 6 }}
                classNames={{
                  textarea: classNames(
                    styles.textArea
                  ),
                }}
                value={text.trim()}
                style={{ color: text.length ? '#101114' : '' }}
                onChange={(e) => setText(e.target.value?.trim())}
                onPressEnter={sendMessage}
              />
              <>
                <Button
                  onClick={sendMessage}
                  className={classNames(text.length ? styles.askModalSendText : styles.askModalSendText__noContent)}>
                  发送
                </Button>
              </>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
