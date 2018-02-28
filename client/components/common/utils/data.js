/**
 * @description tool function
 */
import axios from 'axios';
import qs from 'qs';

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
/**
 * @description 确保 path 符合 /xx/xxx/ 格式
 * @param {string} path 需要格式化的 path
 */
export const ensurePath = path => (`/${path}/`).replace(/[\/]{2,}/g, '/');

/**
 * @description 判断 pathname 是否为 path 的子 path，即 pathname.indexOf(path) === 0
 * @param {string} pathname
 * @param {string} path
 */
export const isActive = (pathname, path) => {
  if (pathname === '/' || path === '/') {
    return pathname === path;
  }
  return pathname.indexOf(path) === 0;
};

// @description 格式化顶部导航栏
export const routesFilter = (routes, contextPath = '/', contextName = 'App.routes.', depth = 0) => {
  const newRoutes = [];
  depth++;
  routes.forEach((route) => {
    const { childRoutes = [], path, name, hideInNav, redirect } = route;
    if (path.indexOf('*') === -1 && !redirect) {
      const newContextPath = ensurePath(`${contextPath}/${path}/`);
      const newContextName = contextName + name;
      const newRoute = {
        ...route,
        path: newContextPath,
        contextName: newContextName,
        name,
        subItems: []
      };
      if (childRoutes.length > 1 || depth) {
        newRoute.subItems = routesFilter(childRoutes, newContextPath, `${newContextName}.`, depth);
      }
      if (newRoute.subItems.length < 2 && !depth) {
        newRoute.subItems = [];
      }
      if (!hideInNav) {
        newRoutes.push(newRoute);
      }
    }
  });
  return newRoutes;
};

export const loadData = (url, method, param, config) => axios[method](url, param, config)
  .then((res) => {
    const { status } = res;
    let { data } = res;
    let error = 0;
    if (status !== 200) {
      error = status;
    } else if (typeof data !== 'object') {
      error = 2136;
    } else if (data instanceof Array) {
      data = { data };
    } else {
      const { code } = data;
      if (code) {
        error = code; // if using code as error status
      }
    }
    return {
      error,
      ...(data || {})
    };
  },
  (error) => {
    const { response } = error;
    if (response) {
      const { status, statusText, data: { error: err, message, status: stat } = {} } = response;
      return { error: status || stat, message: message || err || statusText };
    }
    return { error: 2136, message: error.message || error };
  });

export const objToQuery = (param) => {
  if (!param || param instanceof String) {
    return param;
  }
  const newParams = {};
  Object
    .keys(param)
    .map((k) => {
      const v = param[k];
      newParams[k] = typeof v === 'object' && v ? JSON.stringify(v) : v;
    });
  return qs.stringify(newParams);
};

export const dataLoader = {
  get: (url, params = {}, config) => loadData(url, 'get', {
    params: params.params || params
  }, config),
  post: (url, data, config) => loadData(url, 'post', config ? data.params || data : objToQuery(data.params || data), config)
};

// 格式化表报列表
export const subNavFormat = (routes, contextPath = '/') => {
  if (routes instanceof Array) {
    const newRoutes = [];
    routes.forEach((route) => {
      const { profile = {}, items, navs } = route;
      const childRoutes = items || navs;
      const newRoute = {
        ...profile,
        ...route
      };
      const newContextPath = ensurePath(`${contextPath}/${newRoute.id}/`);
      newRoute.path = newContextPath;
      if (childRoutes) {
        newRoute.subItems = subNavFormat(childRoutes, newContextPath);
      }
      newRoutes.push(newRoute);
    });
    return newRoutes;
  }
  return null;
};

/**
 * @description Sanitizing 对字符串进行 xss 转义
 * @param {string|number} str 需要 xss 转义的字符串
 */
export function Sanitizing(str = '') {
  return String(!str && str !== 0 ? '' : str).replace(/<script[^>]*?>.*?<\/script>/gi, '')
    .replace(/<[\/\!]*?[^<>]*?>/gi, '')
    .replace(/<style[^>]*?>.*?<\/style>/gi, '')
    .replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '')
    // .replace(/&/g, '&amp;') // not necessary
    .replace(/"/g, '&quot;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;');
}

/**
 * @description check 登录状态
 */
export function CheckLoginState() {
  let userInfo = null;
  if (typeof document !== 'undefined') {
    document.cookie.replace(/(userName)=([^;]+)/g, (mat, key, value) => {
      userInfo = { [key]: value };
    });
  }
  return userInfo;
}

