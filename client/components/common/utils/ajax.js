/**
 * @component ajax
 * @description 需要 `import { get, post } from 'src/feature/common/'`
 */
import { dataLoader } from './data';


const wrappedLoadData = (newUrl, method, data, config) => dataLoader[method](newUrl, data, config);

/**
 * @description post 会自动登录
 * @method post
 * @param {string} url
 * @param {object} data
 * @param {object} [config] 可选参数，以任意配置请求选项
 * @param {boolean} [loading] 是否显示 loading 效果，默认显示
 */
export function post(url, data, cnf, loading) {
    return wrappedLoadData(url, 'post', data, cnf);
}

const jsonCnf = {
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
};

/**
 * @description postJSON 会自动登录 直接以 json 形式向后端传递数据 header 'Content-Type': 'application/json;charset=utf-8',
 * @method postJSON
 * @param {string} url
 * @param {object} data
 * @param {boolean} [loading] 是否显示 loading 效果，默认显示
 */
export function postJSON(url, data, loading) {
    return post(url, data, jsonCnf, loading);
}

/**
 * @description get 会自动登录
 * @method get
 * @param {string} url
 * @param {object} data
 * @param {object} [config] 可选参数，以任意配置请求选项
 */
export function get(url, param, cnf, loading) {
    let res = wrappedLoadData(url, 'get', param, cnf);
    return res;
}

/**
 * @description getWithLoading 显示 loading 效果的 get 会自动登录
 * @method getWithLoading
 * @param {string} url
 * @param {object} data
 */
export function getWithLoading(url, param, cnf) {
    return get(url, param, cnf, true);
}

/**
 * @description getJSON 会自动登录 直接以 json 形式向后端传递数据 header 'Content-Type': 'application/json;charset=utf-8',
 * @method getJSON
 * @param {string} url
 * @param {object} data
 */
export function getJSON(url, param) {
    return get(url, param, jsonCnf);
}
