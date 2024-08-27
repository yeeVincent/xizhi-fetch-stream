import { type Dispatch, type FC, forwardRef, type SetStateAction, useImperativeHandle, useRef } from 'react'
import classNames from 'classnames'

import { delay } from 'lodash'


import { handleError } from './ErrorStrategy'

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
  const {  setHistory, handleScrollToBottom,  } = props
  const ref = useRef<FetchComponentRef>(null)
  const baseUrl = 'http://localhost:3000'
  const url = '/chat/message/streaming/'
  const styles =  portraitStyles

  const defaultHeaders = {
    Auth: '123456'
  }
  // 正常结束
  const handleFinish = () => {
    delay(() => {
      if(!ref.current)return
      const content = ref.current?.streamList.map((stream) => stream.data.content).join('')
      console.log(ref.current?.streamList, 'content')

      setHistory((prev) => {
        const lastItem = prev.splice(-1, 1)[0]
        lastItem.reply_content = content
        lastItem.status = AskMessageStatus.Completed
        return [...prev, lastItem]
      })
    }, 0)
  }
  function start(sse_key: string) {
    if(!ref.current)return
    ref.current.start<DataType>(baseUrl + url, {
      headers: {
        ...defaultHeaders,
      },
      params: {
        sse_key,
        resp_is_sse: true,
      },
      onmessage(event) {
        handleScrollToBottom()
        if (event.code !== 200) return handleError(event.code, setHistory)
        if (event.data.finish) {
          handleFinish()
          return event
        }
        return event
      },
    })
  }

  useImperativeHandle(propsRef, () => {

    return {
      streamList: ref.current!.streamList!,
      start: start,
      stop: ref.current!.stop!,
      reset: ref.current!.reset!,
      setStreamItem: ref.current!.setStreamItem!,
      getStreamItem: ref.current!.getStreamItem!,
      removeStreamItem: ref.current!.removeStreamItem!,
    }
  })

  const CustomStreamItem: FC<{ event: DataType }> = (props) => {
    const { event } = props
    return <span className={styles.op}>{event.data.content}</span>
  }
  return (
    <div className={classNames(styles.op_streamContainer,)}>
      <FetchStream ref={ref} CustomStreamItem={CustomStreamItem}></FetchStream>
      <div className={styles.op_streamContainer__loading}></div>
    </div>
  )
})

export default StreamComponent
