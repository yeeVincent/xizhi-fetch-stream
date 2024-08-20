import {  FC } from 'react';
import Panel from './panel'
import { EventSourceMessage } from '@microsoft/fetch-event-source';

export interface FetchStreamProps {

  /** 自定义 StreamItem 组件 */
  CustomStreamItem ?: FC<{event: EventSourceMessage}>
}

const FetchStream: FC<FetchStreamProps> = (props) => {
  return <Panel { ...props} ></Panel>
};

export default (FetchStream);
