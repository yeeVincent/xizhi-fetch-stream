import { type FC, Fragment } from 'react'
import { type EventSourceMessage } from '@microsoft/fetch-event-source'

interface PanelProps {
  streamList: EventSourceMessage[]
  CustomStreamItem?: FC<{ event: EventSourceMessage }>
}

const StreamPanel: FC<PanelProps> = (props) => {
  const { CustomStreamItem, streamList } = props
  const StreamItem = ({ event }: { event: EventSourceMessage }) => <span>{event.data}</span>

  return (
    <>
      {streamList.map((event) => (
        <Fragment key={event?.id || event?.data || String(event)}>
          {CustomStreamItem && <CustomStreamItem event={event}></CustomStreamItem>}
          {!CustomStreamItem && <StreamItem event={event}></StreamItem>}
        </Fragment>
      ))}
    </>
  )
}

export default StreamPanel
