import { axios } from '@/utils/request'

const baseUrl = 'http://localhost:8090/api/admin/folder'

const folderApi = {}

folderApi.query = params => {
  return axios({
    url: baseUrl,
    params: params,
    method: 'get'
  })
}

folderApi.deleted = params => {
  return axios({
    url: baseUrl,
    params: params,
    method: 'delete'
  })
}

folderApi.rename = params => {
  return axios({
    url: baseUrl + '/rename',
    params: params,
    method: 'put'
  })
}

export default folderApi
