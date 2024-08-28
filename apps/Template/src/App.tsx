import styles from './App.module.scss'
import classNames from 'classnames';
import { Fragment } from 'react/jsx-runtime';
import { Button, Divider, Modal } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useRef, useState } from 'react';
import thumbIcon__blue_fill from './assets/svg/thumbIcon-blue_fill.svg'
import thumbIcon__normal from './assets/svg/thumbIcon-normal.svg'
import StreamComponent from './components/StreamComponent';
import { delay } from 'lodash';
import { AskMessageStatus, FeedbackStatus, HistoryMessageItem, StreamComponentRef } from './type';
import useNetworkStatus from './hooks';

export const App = () => {
  const [history, setHistory] = useState<HistoryMessageItem[]>([])
  const scrollDomRef = useRef<HTMLDivElement>(null)
  const [text, setText] = useState('')
  const streamComponentRef = useRef<StreamComponentRef>(null)
  const [askModalVisible] = useState<boolean>(true)

  /**网络状态*/
  const [isOnline, setIsOnline] = useState(true)
  const { isOnline: systemOnlineStatus } = useNetworkStatus({
    handleOfflineCallback: () => {
      setIsOnline(false)
    },
  })

  const handleReconnect = () => {
    if (!systemOnlineStatus) return
    setIsOnline(true)
  }
  const handleReviewClick = async (item: HistoryMessageItem, feedback: FeedbackStatus) => {
    if (item.feedback !== FeedbackStatus.None) return
    setHistory((pre) => {
      return pre.map((mes) => {
        if (mes.id === item.id) {
          mes.feedback = feedback
        }
        return mes
      })
    })
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
          status: AskMessageStatus.Sending,
        },
      ]
    })

    setText('')
    setHistory((prev) => {
      return prev.map((item) => {
        if (item.id === customId) {
          item.status = AskMessageStatus.Processing
        }
        return item
      })
    })
    delay(() => {
      fetchSSE('sse_key')
      handleScrollToBottom()
    }, 0)


  }
  return <>
    <Modal
      classNames={{
        content: classNames(
          styles.askModalContent,
        ),
      }}
      className={classNames(styles.askModal)} footer={null} closable={false}
      maskClosable={false} centered title="对话框, 快来和我聊天吧~啦啦啦" open={askModalVisible}>
      <div className={styles.askWrapper}>
        <Divider style={{ marginTop: 0, marginBottom: 4 }} />
        <div className={styles.askWrapperInner} >
          <div className={classNames(styles.messageWrapper)} ref={scrollDomRef}>
            {history.map((item) => {
              return (
                <Fragment key={item.id}>
                  <div className={classNames(styles.meContainer,)}>
                    <span className={styles.me}>{item.content}</span>
                  </div>
                  {item.reply_content && (
                    <div className={classNames(styles.opContainer,)}>
                      <div>
                        <span className={styles.op}>{item.reply_content}</span>
                        <div className={styles.reviewContainer}>
                          <div className={styles.review}>
                            {item.feedback !== FeedbackStatus.Helpful && (
                              <Button
                                className={styles.thumbIcon__good}
                                onClick={() => handleReviewClick(item, FeedbackStatus.Helpful)}>
                                <img src={thumbIcon__normal} alt='' />
                              </Button>
                            )}
                            {item.feedback === FeedbackStatus.Helpful && (
                              <img src={thumbIcon__blue_fill} alt='' className={styles.thumbIcon__good} />
                            )}
                            {item.feedback !== FeedbackStatus.Unhelpful && (
                              <Button
                                className={styles.thumbIcon__navigator}
                                onClick={() => handleReviewClick(item, FeedbackStatus.Unhelpful)}>
                                <img src={thumbIcon__normal} alt='' />
                              </Button>
                            )}
                            {item.feedback === FeedbackStatus.Unhelpful && (
                              <img src={thumbIcon__blue_fill} alt='' className={styles.thumbIcon__navigator} />
                            )}
                          </div>
                        </div>
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
          {(!isOnline || !systemOnlineStatus) && (
            <div className={styles.askModalAlertContainer}>

              网络连接异常,
              <a
                style={{
                  textDecoration: 'underline',
                }}
                onClick={handleReconnect}>
                请重新连接
              </a>
            </div>
          )}
          <div className={styles.textAreaContainer}>
            <TextArea
              placeholder='输入点什么吧...'
              autoSize={{ minRows: 2, maxRows: 6 }}
              classNames={{
                textarea: classNames(
                  styles.textArea,
                  // text.length ? styles.textArea__hasContent : styles.textArea__noContent
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
                className={classNames(text.length ? styles.askModalSendText : styles.askModalSendText__noContent)}
              >
                发送
              </Button>

            </>
          </div>
        </div>
      </div>
    </Modal>
  </>
}
