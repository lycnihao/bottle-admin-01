import { axios } from '@/utils/request'

const baseUrl = 'http://localhost:8090/api/admin/directory'

const directoryApi = {}

directoryApi.query = params => {
  return axios({
    url: baseUrl,
    params: params,
    method: 'get'
  })
}

directoryApi.deleted = params => {
  return axios({
    url: baseUrl,
    params: params,
    method: 'delete'
  })
}

directoryApi.rename = params => {
  return axios({
    url: baseUrl + '/rename',
    params: params,
    method: 'put'
  })
}

export default directoryApi
