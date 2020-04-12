import { axios } from '@/utils/request'

const baseUrl = '/api/admin/options'

const optionApi = {}

optionApi.listAll = keys => {
  return axios({
    url: `${baseUrl}/map_view`,
    params: {
      key: keys
    },
    method: 'get'
  })
}

optionApi.query = params => {
  return axios({
    url: `${baseUrl}/list_view`,
    params: params,
    method: 'get'
  })
}

optionApi.save = options => {
  return axios({
    url: `${baseUrl}/map_view/saving`,
    method: 'post',
    data: options
  })
}

optionApi.create = option => {
  return axios({
    url: baseUrl,
    data: option,
    method: 'post'
  })
}

optionApi.delete = optionId => {
  return axios({
    url: `${baseUrl}/${optionId}`,
    method: 'delete'
  })
}

optionApi.get = optionId => {
  return axios({
    url: `${baseUrl}/${optionId}`,
    method: 'get'
  })
}

optionApi.update = (optionId, option) => {
  return axios({
    url: `${baseUrl}/${optionId}`,
    data: option,
    method: 'put'
  })
}

optionApi.type = {
  INTERNAL: {
    value: 'INTERNAL',
    text: '系统'
  },
  CUSTOM: {
    value: 'CUSTOM',
    text: '自定义'
  }
}

export default optionApi
