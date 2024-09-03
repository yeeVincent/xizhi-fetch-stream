import { type EventSourceMessage, fetchEventSource, type FetchEventSourceInit } from '@microsoft/fetch-event-source'
import queryString from 'query-string'

export interface RequestProps {
  url: string
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH'
  params?: Record<string, any>
  headers?: Record<string, string>
}

export interface ResponseType<T> extends Response {
  data: T
}

export interface EventMessageType<T> extends Omit<EventSourceMessage, 'data'> {
  data: T
}

export interface FetchEventSourceInitExtends<T> extends Omit<FetchEventSourceInit, 'onmessage'> {
  /** 接口需要传递的参数, 如果是get方法, 会拼接到url中, 如果是post方法, 会放在body中 */
  params?: { onmessage?: (ev: T) => T; [key: string]: any }
  timeout?: number
  headers?: Record<string, string>
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH'
  /** 传入signal需要同时传入abortController  */
  signal?: AbortSignal
  /** 回传EventSourceMessage, 以修改数据 */
  onmessage?: (ev: T, eventList: T[]) => T | void
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TimeoutError'
  }
}

/** fetch的封装类 */
class StreamFetcher {
  protected clientOnError: ((err: any) => number | null | undefined | void) | undefined = undefined
  protected abortController: AbortController | undefined = undefined
  public eventList: any[] = []
  constructor() {}
  /**
   * 请求拦截器
   */
  protected async interceptorsRequest(props: RequestProps): Promise<{ url: string; options: FetchEventSourceInit }> {
    const { url: urlFromProps, method, params, headers: customHeader = {}, ...rest } = props
    let queryParams = '' // url参数
    let requestPayload = '' // 请求体数据
    // 请求头
    const headers = {}
    let url = urlFromProps

    if (method === 'GET' || method === 'DELETE') {
      // fetch对GET请求等，不支持将参数传在body上，只能拼接url
      if (params) {
        queryParams = queryString.stringify(params)
        url = `${url}?${queryParams}`
      }
    } else {
      // 非form-data传输JSON数据格式
      if (!['[object FormData]', '[object URLSearchParams]'].includes(Object.prototype.toString.call(params))) {
        Object.assign(headers, { 'Content-Type': 'application/json; charset=utf-8' })
        requestPayload = JSON.stringify(params)
      }
    }
    /** 兼容 header 覆盖 */
    if (customHeader) Object.assign(headers, customHeader)

    const options: FetchEventSourceInit = {
      ...rest,
      method,
      headers,
      body: method !== 'GET' && method !== 'DELETE' ? requestPayload : undefined,
    }
    return {
      url,
      options,
    }
  }

  /**
   * 响应拦截器
   */
  protected interceptorsResponse<T>(response: EventSourceMessage) {
    try {
      const res: T = response.data && JSON.parse(response.data)
      return res
    } catch (error) {
      this.errorHandler(error)
    }
  }

  protected errorHandler(error: unknown) {
    console.log(error, 'error')
    this.clientOnError?.(error)
    return error
  }

  protected timeoutHandler(timeout: number = 15000) {
    let timer: any
    const resetTimer = () => {
      clearTimeout(timer)
      if (timeout) {
        timer = setTimeout(() => {
          const errorMessage = 'timeout'
          this.abortController?.abort?.(new TimeoutError(errorMessage))
          this.errorHandler(new TimeoutError(errorMessage))
        }, timeout)
      }
    }

    resetTimer()
    const getTimer = () => timer
    return [getTimer, resetTimer] as const
  }

  protected finallyHandler() {}

  public fetch = async <T>(url: string, params: FetchEventSourceInitExtends<T>) => {
    this.reset()
    this.clientOnError = params.onerror
    this.abortController = new AbortController()
    const [getTimer, resetTimer] = this.timeoutHandler(params.timeout)
    try {
      const req = await this.interceptorsRequest({ url, ...params })

      const messageHandler = (ev: EventSourceMessage) => {
        const res = this.interceptorsResponse<T>(ev)
        if (!res) return
        this.eventList = [...this.eventList, res]
        // console.log(res, 'event')
        params?.onmessage?.(res!, this.eventList)
        resetTimer()
      }

      await fetchEventSource(req.url, {
        ...params,
        ...req.options,
        signal: this.abortController.signal,
        onmessage: messageHandler,
      })
    } catch (error) {
      throw this.errorHandler(error)
    } finally {
      this.finallyHandler()
      if (getTimer()) {
        clearTimeout(getTimer())
      }
    }
  }

  public getEventList = () => this.eventList

  public abort = () => {
    this.abortController?.abort?.()
  }

  public reset = () => {
    this.abortController = undefined
    this.eventList = []
  }
}

export default StreamFetcher
