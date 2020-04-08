import { axios } from '@/utils/request'

const baseUrl = 'http://localhost:8090/api/admin/folder'

const attachmentApi = {}

attachmentApi.query = params => {
  return axios({
    url: baseUrl,
    params: params,
    method: 'get'
  })
}

attachmentApi.get = attachmentId => {
  return axios({
    url: `${baseUrl}/${attachmentId}`,
    method: 'get'
  })
}

attachmentApi.delete = attachmentId => {
  return axios({
    url: `${baseUrl}/${attachmentId}`,
    method: 'delete'
  })
}

attachmentApi.deleteInBatch = attachmentIds => {
  return axios({
    url: `${baseUrl}`,
    method: 'delete',
    data: attachmentIds,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

attachmentApi.update = (attachmentId, attachment) => {
  return axios({
    url: `${baseUrl}/${attachmentId}`,
    method: 'put',
    data: attachment
  })
}

attachmentApi.getMediaTypes = () => {
  return axios({
    url: `${baseUrl}/media_types`,
    method: 'get'
  })
}

attachmentApi.getTypes = () => {
  return axios({
    url: `${baseUrl}/types`,
    method: 'get'
  })
}

attachmentApi.CancelToken = axios.CancelToken
attachmentApi.isCancel = axios.isCancel

attachmentApi.upload = (formData, uploadProgress, cancelToken) => {
  return axios({
    url: `${baseUrl}/upload`,
    timeout: 8640000, // 24 hours
    data: formData, // form data
    /* onUploadProgress: uploadProgress, */
    cancelToken: cancelToken,
    method: 'post'
  })
}

attachmentApi.uploads = (formDatas, uploadProgress, cancelToken) => {
  return axios({
    url: `${baseUrl}/uploads`,
    timeout: 8640000, // 24 hours
    data: formDatas, // form data
    onUploadProgress: uploadProgress,
    cancelToken: cancelToken,
    method: 'post'
  })
}

attachmentApi.type = {
  LOCAL: {
    type: 'LOCAL',
    text: '本地'
  },
  SMMS: {
    type: 'SMMS',
    text: 'SM.MS'
  },
  UPOSS: {
    type: 'UPOSS',
    text: '又拍云'
  },
  QINIUOSS: {
    type: 'QINIUOSS',
    text: '七牛云'
  },
  ALIOSS: {
    type: 'ALIOSS',
    text: '阿里云'
  },
  BAIDUBOS: {
    type: 'BAIDUBOS',
    text: '百度云'
  },
  TENCENTCOS: {
    type: 'TENCENTCOS',
    text: '腾讯云'
  }
}

export default attachmentApi
