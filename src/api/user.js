import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/auth/me',
    method: 'get'
  })
}

export function toPortal() {
  return request({
    url: '/auth/to-portal',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

export function updateUser(id, data) {
  return request({
    url: `/user/${id}/admin`,
    method: 'post',
    data
  })
}

export function createUser(data) {
  return request({
    url: `/user/admin`,
    method: 'post',
    data
  })
}

export const changeAvatar = '/profile/avatar/admin'

