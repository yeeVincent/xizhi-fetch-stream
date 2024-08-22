import { type EventSourceMessage, fetchEventSource, type FetchEventSourceInit } from '@microsoft/fetch-event-source'
import { delay } from 'lodash'
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

export interface FetchEventSourceInitExtends extends FetchEventSourceInit {
  /** 接口需要传递的参数, 如果是get方法, 会拼接到url中, 如果是post方法, 会放在body中 */
  params?: any
  abortController?: AbortController
  timeout?: number
  headers?: Record<string, string>
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH'
  /** @deprecated 请使用受控组件的stop方法, 该属性已废弃 */
  signal?: AbortSignal
  /** 回传EventSourceMessage, 以修改数据 */
  onmessage?: (event: EventMessageType<any>) => EventMessageType<any> | void
}

class StreamFetcher {
  constructor() {}
  /**
   * 请求拦截器
   */
  async interceptorsRequest(props: RequestProps): Promise<{ url: string; options: FetchEventSourceInit }> {
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
  protected async interceptorsResponse(response: EventSourceMessage) {
    try {
      const res: EventMessageType<any> = JSON.parse(response.data)
      return res
    } catch (error) {
      this.errorHandler(error)
    }
  }

  protected errorHandler(error: unknown) {
    console.log(error, 'error')
    return error
  }

  protected timeoutHandler(controller: AbortController, timeout: number = 15000) {
    let timer: number = 0
    if (timeout) {
      timer = delay(() => {
        controller.abort(new Error('网络请求超时，请稍后再试'))
      }, timeout)
    }
    return [timer, controller.signal] as const
  }

  protected finallyHandler() {}

  public fetch = async (url: string, params: FetchEventSourceInitExtends) => {
    const [timer, signal] = this.timeoutHandler(params.abortController!, params.timeout || 15000)
    try {
      const req = await this.interceptorsRequest({ url, ...params })
      await fetchEventSource(req.url, {
        ...params,
        ...req.options,
        signal,
        onmessage: async (ev) => {
          const res = await this.interceptorsResponse(ev)
          params?.onmessage?.(res!)
        },
      })
    } catch (error) {
      throw this.errorHandler(error)
    } finally {
      this.finallyHandler()
      if (timer) {
        clearTimeout(timer)
      }
    }
  }
}

export default StreamFetcher
