import styles from './App.module.scss'
import classNames from 'classnames'
import { Fragment } from 'react/jsx-runtime'
import { Button, Divider, Modal } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { FC, useRef, useState } from 'react'
import { AskMessageStatus, DataType, FeedbackStatus, HistoryMessageItem } from './type'
import FetchStream, { FetchComponentRef } from '@repo/stream'
import { delay } from 'lodash'

export const App = () => {
  const [history, setHistory] = useState<HistoryMessageItem[]>([])
  const scrollDomRef = useRef<HTMLDivElement>(null)
  const [text, setText] = useState('')
  const baseUrl = 'http://localhost:3000'
  const url = '/stream'
  const [streamList, setStreamList] = useState([])
  const ref = useRef<FetchComponentRef>(null)
  const defaultHeaders = {
    Authorization: 'token xxx',
  }
  // 正常结束
  const handleFinish = (eventList: any[]) => {
    delay(() => {
      if (!ref.current) return
      const content = eventList.map((stream) => stream.data.content).join('')

      setHistory((prev) => {
        const lastItem = prev.splice(-1, 1)[0]
        lastItem.reply_content = content
        lastItem.status = AskMessageStatus.Completed
        return [...prev, lastItem]
      })
    }, 0)
  }

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
    if (!ref.current) return
    ref.current.start<DataType>(baseUrl + url, {
      headers: {
        ...defaultHeaders,
      },
      params: {
        sse_key,
      },
      onmessage(event, eventList) {
        console.log(event, 'event');
        handleScrollToBottom()
        if (event.data.finish) {
          handleFinish(eventList)
        }
        return event
      },
    })
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

  const CustomStreamItem: FC<{ event: DataType }> = (props) => {
    const { event } = props
    return <span className={styles.op}>{event?.data?.content}</span>
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
                        <div className={classNames(styles.op_streamContainer)}>
                          <FetchStream
                            streamList={streamList}
                            setStreamList={setStreamList}
                            ref={ref}
                            CustomStreamItem={CustomStreamItem}></FetchStream>
                          <div className={styles.op_streamContainer__loading}></div>
                        </div>
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
