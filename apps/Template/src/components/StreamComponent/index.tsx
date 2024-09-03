import { type Dispatch, type FC, forwardRef, type SetStateAction, useImperativeHandle, useRef, useState } from 'react'
import classNames from 'classnames'

import { delay } from 'lodash'

import portraitStyles from '../../App.module.scss'
import FetchStream, { FetchComponentRef } from '@repo/stream'
import { AskMessageStatus, HistoryMessageItem, StreamComponentRef } from '../../type'

interface Props {
  setHistory: Dispatch<SetStateAction<HistoryMessageItem[]>>

  handleScrollToBottom: () => void
}

interface DataType {
  data: {
    id: string
    content: string
    finish: boolean
  }
  code: number
  msg: string
}

const StreamComponent = forwardRef<StreamComponentRef, Props>((props, propsRef) => {
  const { setHistory, handleScrollToBottom } = props

  const [streamList, setStreamList] = useState([])
  const ref = useRef<FetchComponentRef>(null)
  const baseUrl = 'http://localhost:3000'
  const url = '/stream'
  const styles = portraitStyles

  const defaultHeaders = {
    Auth: '123456',
  }
  // 正常结束
  const handleFinish = (eventList: any[]) => {
    delay(() => {
      if (!ref.current) return
      const content = eventList.map((stream) => stream.data.content).join('')
      // console.log(eventList, 'content')

      setHistory((prev) => {
        const lastItem = prev.splice(-1, 1)[0]
        lastItem.reply_content = content
        lastItem.status = AskMessageStatus.Completed
        return [...prev, lastItem]
      })
    }, 0)
  }
  function start(sse_key: string) {
    if (!ref.current) return
    ref.current.start<DataType>(baseUrl + url, {
      headers: {
        ...defaultHeaders,
      },
      params: {
        sse_key,
      },
      onmessage(event, eventList) {
        handleScrollToBottom()
        if (event.data.finish) {
          handleFinish(eventList)
        }
        return event
      },
    })
  }

  useImperativeHandle(propsRef, () => {
    return {
      start: start,
      stop: ref.current!.stop!,
      reset: ref.current!.reset!,
    }
  })

  const CustomStreamItem: FC<{ event: DataType }> = (props) => {
    const { event } = props
    return <span className={styles.op}>{event.data.content}</span>
  }
  return (
    <div className={classNames(styles.op_streamContainer)}>
      <FetchStream
        streamList={streamList}
        setStreamList={setStreamList}
        ref={ref}
        CustomStreamItem={CustomStreamItem}></FetchStream>
      <div className={styles.op_streamContainer__loading}></div>
    </div>
  )
})

export default StreamComponent
