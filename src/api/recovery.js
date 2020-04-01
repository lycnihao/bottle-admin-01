import { axios } from '@/utils/request'

const baseUrl = '/api/admin/recoveries'

const recoveryApi = {}

recoveryApi.migrate = formData => {
  return axios({
    url: `${baseUrl}/migrations/v0_4_3`,
    data: formData,
    method: 'post'
  })
}

export default recoveryApi
