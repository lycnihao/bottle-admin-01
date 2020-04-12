import { axios } from '@/utils/request'

const baseUrl = '/api/admin'

const adminApi = {}

adminApi.counts = () => {
  return axios({
    url: `${baseUrl}/counts`,
    method: 'get'
  })
}

adminApi.isInstalled = () => {
  return axios({
    url: `${baseUrl}/is_installed`,
    method: 'get'
  })
}

adminApi.environments = () => {
  return axios({
    url: `${baseUrl}/environments`,
    method: 'get'
  })
}

adminApi.install = data => {
  return axios({
    url: `${baseUrl}/installations`,
    data: data,
    method: 'post'
  })
}

adminApi.login = (username, password) => {
  return axios({
    url: `${baseUrl}/login`,
    data: {
      username: username,
      password: password
    },
    method: 'post'
  })
}

adminApi.logout = () => {
  return axios({
    url: `${baseUrl}/logout`,
    method: 'post'
  })
}

adminApi.refreshToken = refreshToken => {
  return axios({
    url: `${baseUrl}/refresh/${refreshToken}`,
    method: 'post'
  })
}

adminApi.sendResetCode = param => {
  return axios({
    url: `${baseUrl}/password/code`,
    data: param,
    method: 'post'
  })
}

adminApi.resetPassword = param => {
  return axios({
    url: `${baseUrl}/password/reset`,
    data: param,
    method: 'put'
  })
}

adminApi.updateAdminAssets = () => {
  return axios({
    url: `${baseUrl}/halo-admin`,
    method: 'put',
    timeout: 600 * 1000
  })
}

adminApi.getApplicationConfig = () => {
  return axios({
    url: `${baseUrl}/spring/application.yaml`,
    method: 'get'
  })
}

adminApi.updateApplicationConfig = content => {
  return axios({
    url: `${baseUrl}/spring/application.yaml`,
    params: {
      content: content
    },
    method: 'put'
  })
}

adminApi.restartApplication = () => {
  return axios({
    url: `${baseUrl}/spring/restart`,
    method: 'post'
  })
}

adminApi.getLogFiles = lines => {
  return axios({
    url: `${baseUrl}/halo/logfile`,
    params: {
      lines: lines
    },
    method: 'get'
  })
}

adminApi.downloadLogFiles = lines => {
  return axios({
    url: `${baseUrl}/halo/logfile/download`,
    params: {
      lines: lines
    },
    method: 'get'
  })
}

export default adminApi
