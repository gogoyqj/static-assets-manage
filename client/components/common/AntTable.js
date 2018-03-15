/**
 * @component AntTable 
 * @description 可搜索、异步加载、联动的下拉选择，基于 antd/Table 封装
 */
import React, { Component } from 'react';
import { Table, Input, Button, message } from 'antd';
import { autobind } from 'core-decorators';
import { get, i18n, safe } from './utils';

const defaultConfig = {
  rowKey: ({ id }) => `${id}`
};
const defaultPagination = {
  showTotal: total => `共 ${total} 条`,
  pageSizeOptions: '10,20,50,100'.split(','),
  showSizeChanger: true,
  pageSize: 10,
  current: 1
};

export default class AntTable extends Component {
  /**
   * @property fetch
   * @description 拉取数据的url或者函数
   * @type string/function
   */
  /**
   * @property fetchOnce
   * @description 如果 fetch 是 url/function，结合 fetchOnce 用以设置在翻页的时候，是否需要异步拉取数据
   * @type boolean
   */
  /**
   * @property pagination
   * @description 翻页配置
   * @type boolean/Object
   */
  constructor(props) {
    super(props);
    const { pagination = {} } = props;
    this.state = {
      filteredInfo: {},
      sortedInfo: null,
      data: props.config.dataSource || [],
      originalData: props.config.dataSource || [], // 用于过滤以及恢复过滤
      pagination: pagination === false ? false : {
        ...defaultPagination,
        ...pagination
      },
      loading: false
    };
    this.lastFetchId = 0;
  }
  
  componentDidMount() {
    this.fetch({}, 'force');
  }

  componentWillReceiveProps(nextProps) {
    const { pagination, fetch } = nextProps;
    const { pagination: page, fetch: lastFetch } = this.props;
    if (pagination !== page) {
      this.state.pagination = pagination === false ? false : {
        ...defaultPagination,
        ...pagination
      };
    }
    // 非异步加载数据的，更新 originalData
    if (!fetch) {
      this.state.originalData = this.state.data = nextProps.config.dataSource;
    } else if (fetch !== lastFetch) { // fetch 变化 reset 到第一页
      if (this.state.pagination) {
        this.state.pagination.current = 1;
      }
      this.fetch({}, 'force', nextProps);
    }
  }

  componentWillUnmount() {
    this.lastFetchId = NaN;
    this.setState = () => null;
  }

  @autobind
  handleTableChange(pagination = {}, filters, sorter) {
    const { field, order } = sorter;
    this.state.pagination = { ...this.state.pagination, ...pagination };
    this.state.sortedInfo = { field, order };
    this.fetch({
      sortField: field,
      sortOrder: order,
      ...filters
    });
  }

  @autobind
  async fetch(query = {}, force, props = this.props) {
    const { fetch, params, fetchOnce } = props;
    const { pageSize, current } = this.state.pagination;
    const { field, order } = this.state.sortedInfo || {};
    const newParams = { pageSize, current, sortField: field, sortOrder: order, ...params, ...query };
    let data;
    if (fetch && (fetchOnce !== true || force)) {
      this.lastFetchId += 1;
      const fetchId = this.lastFetchId;
      this.setState({ loading: true });
      if (typeof fetch === 'function') {
        data = await fetch(newParams);
      } else {
        data = await get(fetch, newParams);
      }
      if (data.error) {
        if (data.error) {
          message.error(i18n(data.message || data.error));
        }
        data = data.data || [];
      } else {
        if (!(Array.isArray(data) || !data)) {
          data = data.data || [];
        }
      }
      const { pagination } = this.state;
      // { data, current, pageSize }
      const { data: arr = data, total } = data;
      if (fetchId === this.lastFetchId) {
        this.state.originalData = arr;
        if (total >= 0) {
          pagination.total = total;
        }
        this.setState({
          data: arr || [],
          loading: false
        });
      }
    } else {
      this.forceUpdate();
    }
  }

  onSearch(dataIndex) {
    const keyword = this.state.filteredInfo[dataIndex];
    const { fetchOnce } = this.props;
    const reg = new RegExp(keyword, 'gi');
    // 服务器端过滤
    if (fetchOnce !== true) {
      const { sortedInfo, pagination, filteredInfo } = this.state;
      if (pagination) {
        pagination.current = 1;
      }
      this.handleTableChange(pagination, { filters: filteredInfo }, sortedInfo || {});
    } else {
      const { originalData } = this.state;
      const filteredData = originalData.filter(row => (row[dataIndex] !== undefined ? String(row[dataIndex]) : '').match(reg));
      this.setState({
        data: filteredData
      });
    }
  }

  formatConfig(config) {
    let { sortedInfo } = this.state;
    const newConfig = {
      ...defaultConfig,
      ...config
    };
    const { columns } = newConfig;
    newConfig.columns = columns.map((c) => {
      const { dataIndex } = c;
      const onSearch = () => this.onSearch(dataIndex);
      const { filteredInfo } = this.state;
      const newC = {
        sorter: ({ [dataIndex]: a }, { [dataIndex]: b }) => {
          const strA = String(a);
          const strB = String(b);
          const aIsNunmer = Number(strA.replace(/,|%$/g, ''));
          const bIsNumber = Number(strB.replace(/,|%$/g, ''));
          if (Number.isNaN(aIsNunmer) || Number.isNaN(bIsNumber)) {
            return strA > strB ? 1 : -1;
          }
          return aIsNunmer - bIsNumber;
        }, // ascend
        ...c,
        filterDropdown: c.filter !== false && (
          <div className="custom-filter-dropdown">
            <Input
              placeholder={`Search ${c.title}`}
              value={filteredInfo[dataIndex] || ''}
              onChange={(e) => {
                filteredInfo[dataIndex] = e.target.value;
                this.setState({});
              }}
              onPressEnter={onSearch}
            />
            <Button type="primary" onClick={onSearch}>Search</Button>
          </div>
        )
      };

      if (sortedInfo) {
        if (sortedInfo.columnKey !== dataIndex) {
          delete newC.sortOrder;
        } else {
          newC.sortOrder = sortedInfo.order;
        }
      } else if (newC.sortOrder && typeof newC.dataIndex !== undefined) {
        sortedInfo = this.state.sortedInfo = {
          order: newC.sortOrder,
          field: newC.dataIndex
        };
      }
      if (dataIndex in filteredInfo) {
        newC.filteredValue = filteredInfo[dataIndex];
      } else {
        newC.filteredValue = null;
      }
      return newC;
    });
    return newConfig;
  }

  @safe
  render() {
    const { config = {} } = this.props;
    const { loading, data, pagination } = this.state;
    return (
      <div className="common-ant-table">
        <Table
          loading={loading}
          {...this.formatConfig(config)}
          dataSource={data}
          onChange={this.handleTableChange}
          pagination={pagination}
        />
      </div>
    );
  }
}
