import { type FC, Fragment } from 'react'

interface PanelProps {
  streamList: unknown[]
  CustomStreamItem?: FC<{ event: unknown }>
}
// 样式面板
const StreamPanel: FC<PanelProps> = (props) => {
  const { CustomStreamItem, streamList } = props
  const StreamItem = ({ event }: { event: unknown }) => <span>{event as any}</span>

  return (
    <>
      {streamList.map((event, i) => (
        <Fragment key={i}>
          {CustomStreamItem && <CustomStreamItem event={event}></CustomStreamItem>}
          {!CustomStreamItem && <StreamItem event={event}></StreamItem>}
        </Fragment>
      ))}
    </>
  )
}

export default StreamPanel
