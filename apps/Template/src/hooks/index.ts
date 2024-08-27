import { useCallback, useEffect, useState } from 'react'

// 定义Hook参数类型
interface UseNetworkStatusOptions {
  handleOfflineCallback?: <T>(...args: T[]) => void
}

const useNetworkStatus = ({ handleOfflineCallback }: UseNetworkStatusOptions = {}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)

  // 处理网络恢复连接的回调函数
  const handleOnline = useCallback(() => {
    console.log('Network status: online')
    setIsOnline(true)
  }, [])

  // 处理网络断开连接的回调函数
  const handleOffline = useCallback(() => {
    console.log('Network status: offline')
    setIsOnline(false)
    // 如果提供了handleOfflineCallback，则在网络断开时调用
    if (handleOfflineCallback) {
      handleOfflineCallback()
    }
  }, [handleOfflineCallback])

  useEffect(() => {
    // 绑定网络状态变化事件监听器
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      // 移除网络状态变化事件监听器
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  return { isOnline, setIsOnline }
}

export default useNetworkStatus
