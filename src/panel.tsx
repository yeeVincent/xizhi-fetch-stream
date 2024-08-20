import { FC, Fragment, memo } from "react";

import { EventSourceMessage } from "@microsoft/fetch-event-source";

interface PanelProps {
  streamList: EventSourceMessage[]
  CustomStreamItem ?: FC<{event: EventSourceMessage}>
}

const Panel : FC<PanelProps>= (props) => {
  const { CustomStreamItem, streamList } = props
  const StreamItem = ({event}: {event: EventSourceMessage}) => <span>{event.data}</span>

  return (
    <>
      {streamList.map(event => (
        <Fragment key={event.id}>
          {CustomStreamItem && <CustomStreamItem event={event}></CustomStreamItem>}
          {!CustomStreamItem &&<StreamItem event={event}></StreamItem>}
        </Fragment>
      ))}
    </>
  );
};

export default memo(Panel);
