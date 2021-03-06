/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { Button, Popconfirm, Icon, Modal, Form, Input, message } from 'antd';
import { AntTable, postJSON, get } from './common';
import commonConfig from '../../config.common';

const apiPrefix = 'api/asset/';
const fetchUrl = `${apiPrefix}list`;
const styles = {
  upload: { float: 'right' }
};
const emptyArray = [];
const required = [ { required: true } ];

const { confirm } = Modal;
const { Item } = Form;

@Form.create()
class AssetForm extends Component {
  render() {
    const {
      items = [],
      form: {
        getFieldDecorator
      }
    } = this.props;
    return (
      <Form>
        {
          items.map(({ itemConfig, decConfig, cpConfig, Cp }) => {
            const { key, label } = itemConfig;
            return (
              <Item {...itemConfig}>
                {
                  getFieldDecorator(`${key}`, decConfig)(
                    <Cp placeholder={label} {...cpConfig} />
                  )
                }
              </Item>
            );
          })
        }
      </Form>
    );
  }
}

class Uploader extends Component {
  onChange = () => {
    const { onChange, beforeUpload } = this.props;
    const file = this.file.files[0];
    const { name, type, size } = file;
    if (beforeUpload(file)) {
      try {
        var reader = new FileReader();
        reader.onload = () => {
          onChange({
            name,
            type,
            content: reader.result
          });
        };
        reader.onerror = (e) => {
          message.error(`转换文件失败: ${e.message}`);
        };
        reader.readAsDataURL(file);
      } catch (e) {
        message.error(`上传文件失败: ${e.message}`);
      }
    } else {
      onChange(undefined);
    }
  }
  render() {
    return (
      <div>
        <input
          type="file"
          ref={(file) => {
            this.file = file;
          }}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

const width = `${100 / 6}%`;
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.assetColumns = [
      {
        title: '资源名',
        width,
        dataIndex: 'name'
      },
      {
        title: '描述信息',
        width,
        dataIndex: 'description'
      },
      {
        title: '上传者',
        width,
        dataIndex: 'owner'
      },
      {
        title: '资源地址',
        width,
        dataIndex: 'id',
        sorter: false,
        filter: false,
        render: id => (<a href={`${commonConfig.assetPrefix}${id}`} target="_blank">{commonConfig.assetPrefix}{id}</a>)
      },
      {
        title: '上传时间',
        width,
        dataIndex: 'created_at'
      },
      {
        title: (
          <div>
            操作
            <Button onClick={() => this.dialog()} type="primary" style={styles.upload}>
              <Icon type="plus" />上传
            </Button>
          </div>
        ),
        width,
        dataIndex: 'id',
        sorter: false,
        filter: false,
        key: 'op',
        render: id => (
          <div>
            <Popconfirm
              title="确定删除资源？"
              onConfirm={() => this.onRemove(id)}
            >
              <Button type="danger">删除</Button>
            </Popconfirm>
          </div>
        )
      }
    ];    
    this.state = {
      fetch: fetchUrl
    };
    this.filter = {};
    try {
      let userName = document.cookie.split(';').find(v => (v.indexOf('userName') !== -1));
      if (userName) {
        this.filter.owner = userName.split('=')[1].trim();
      }
    } catch (e) {
      console.log('userName', userName);
    }
  }
  beforeUpload = (file) => {
    const isJPG = file.type.match(/image\/(jp[e]?g|png|gif|webp)/);
    let err = '';
    if (!isJPG) {
      err = `不允许上传的文件类型:${file.type}`;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      err = `${err} 文件大小不能超过 2M`;
    }
    if (err) {
      message.error(err);
    }
    return isJPG && isLt2M;
  }
  dialog = (asset = {}) => {
    const { id } = asset;
    const { assetColumns, beforeUpload } = this;
    const isAdd = id === undefined;
    const title = `${isAdd ? '新建' : '编辑'}资源`;
    const items = this.assetColumns
      .slice(0, 2)
      .map(({ title, dataIndex }) => ({
        itemConfig: {
          label: title,
          key: dataIndex
        },
        decConfig: {
          rules: dataIndex !== 'description' ? required : emptyArray,
          initialValue: asset[dataIndex]
        },
        Cp: dataIndex !== 'description' ? Input : Input.TextArea
      }));
    items.push({
      itemConfig: {
        key: 'file'
      },
      decConfig: {
        rules: required
      },
      cpConfig: {
        beforeUpload
      },
      Cp: Uploader
    });
    confirm({
      title,
      content: (
        <AssetForm
          ref={(form) => {
            this.form = form;
          }}
          items={items}
        />
      ),
      onOk: () => new Promise((resolve, reject) => {
        this.form.validateFieldsAndScroll((err, values) => {
          if (err) {
            reject(err);
          } else {
            postJSON(`${apiPrefix}${isAdd ? 'add' : 'update'}`, {
              ...asset,
              ...values
            }).then((res) => {
              if (res.error) {
                message.error(`${title}出错: ${res.message || res.error}`);
                reject();
              } else {
                message.success(`${title}成功`);
                this.setState({
                  fetch: `${fetchUrl}?t=${Date.now()}`
                });
                resolve();
              }
            });
          }
        });
      })
    });
  }
  onRemove = (id) => {
    postJSON(`${apiPrefix}remove`, {
      id
    }).then((res) => {
      if (res.error) {
        message.error(`删除出错: ${res.message || res.error}`);
      } else {
        message.success('删除成功');
        this.setState({
          fetch: `${fetchUrl}?t=${Date.now()}`
        });
      }
    });
  }
  render() {
    const { onEdit } = this.props;
    const { fetch } = this.state;
    return (
      <div>
        <AntTable
          config={{
            columns: this.assetColumns 
          }}
          filter={this.filter}
          fetch={fetch}
        />
      </div>
    );
  }
}