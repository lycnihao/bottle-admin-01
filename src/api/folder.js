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

folderApi.getFolderNode = params => {
  return axios({
    url: baseUrl + '/getFolderNode',
		params: params,
    method: 'get'
  })
}

folderApi.moveTo = params => {
  return axios({
    url: baseUrl + '/moveto',
		params: params,
    method: 'post'
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
