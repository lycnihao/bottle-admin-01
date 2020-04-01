import Vue from 'vue'
import { login, getInfo, logout } from '@/api/login'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { welcome } from '@/utils/util'

const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    }
  },

  actions: {
    // 登录
    Login ({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(response => {
          const token = response.access_token
          Vue.ls.set(ACCESS_TOKEN, token, 7 * 24 * 60 * 60 * 1000)
          commit('SET_TOKEN', response)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo().then(response => {
          const result = response.data
					console.log(result)
					result.role = {
						'id': 'admin',
						'name': '管理员',
						'describe': '拥有所有权限',
						'status': 1,
						'creatorId': 'system',
						'createTime': 1497160610259,
						'deleted': 0,
						'permissions': [{
							'roleId': 'admin',
							'permissionId': 'dashboard',
							'permissionName': '仪表盘',
							'actions': '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"query","defaultCheck":false,"describe":"查询"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"}]',
							'actionEntitySet': [{
								'action': 'add',
								'describe': '新增',
								'defaultCheck': false
							}, {
								'action': 'query',
								'describe': '查询',
								'defaultCheck': false
							}, {
								'action': 'get',
								'describe': '详情',
								'defaultCheck': false
							}, {
								'action': 'update',
								'describe': '修改',
								'defaultCheck': false
							}, {
								'action': 'delete',
								'describe': '删除',
								'defaultCheck': false
							}],
							'actionList': null,
							'dataAccess': null
						}]
					}
					result.role.permissions.push({
					  'roleId': 'admin',
					  'permissionId': 'support',
					  'permissionName': '超级模块',
					  'actions': '[{"action":"add","defaultCheck":false,"describe":"新增"},{"action":"import","defaultCheck":false,"describe":"导入"},{"action":"get","defaultCheck":false,"describe":"详情"},{"action":"update","defaultCheck":false,"describe":"修改"},{"action":"delete","defaultCheck":false,"describe":"删除"},{"action":"export","defaultCheck":false,"describe":"导出"}]',
					  'actionEntitySet': [{
					    'action': 'add',
					    'describe': '新增',
					    'defaultCheck': false
					  }, {
					    'action': 'import',
					    'describe': '导入',
					    'defaultCheck': false
					  }, {
					    'action': 'get',
					    'describe': '详情',
					    'defaultCheck': false
					  }, {
					    'action': 'update',
					    'describe': '修改',
					    'defaultCheck': false
					  }, {
					    'action': 'delete',
					    'describe': '删除',
					    'defaultCheck': false
					  }, {
					    'action': 'export',
					    'describe': '导出',
					    'defaultCheck': false
					  }],
					  'actionList': null,
					  'dataAccess': null
					})
          if (result.role && result.role.permissions.length > 0) {
            const role = result.role
            role.permissions = result.role.permissions
            role.permissions.map(per => {
              if (per.actionEntitySet != null && per.actionEntitySet.length > 0) {
                const action = per.actionEntitySet.map(action => { return action.action })
                per.actionList = action
              }
            })
            role.permissionList = role.permissions.map(permission => { return permission.permissionId })
						
            commit('SET_ROLES', result.role)
            commit('SET_INFO', result)
          } else {
						console.log('ccc')
            reject(new Error('getInfo: roles must be a non-null array !'))
          }
					commit('SET_INFO', result)
          commit('SET_NAME', { name: result.nickname, welcome: welcome() })
          commit('SET_AVATAR', result.avatar)

          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve) => {
        logout(state.token).then(() => {
          resolve()
        }).catch(() => {
          resolve()
        }).finally(() => {
          commit('SET_TOKEN', '')
          /* commit('SET_ROLES', []) */
          Vue.ls.remove(ACCESS_TOKEN)
        })
      })
    }

  }
}

export default user
