/**
 * CRUD Table
 *
 * 提供CRUD功能的Table，基于Backbone, 提供local和remote的增删改查功能。
 *
 * 主要配置项
 *
 *     name: {String} 表格名称
 *     columns: {Array} 栏目配置
 *     data: {Array} 提供表格数据
 *     api: {object} 表格remote接口配置
 *
 * 例子
 * var crudTable = new CRUDTable({
 *     name: '联系人表',
 *     columns: [{
 *         name: 'address',
 *         displayName: '地址'
 *     }, {
 *         name: 'tel',
 *         displayName: '电话'
 *     }, {
 *         name: 'name',
 *         displayName: '姓名'
 *     }],
 *     data: [{
 *        name: 'andrew',
 *        tel: '888',
 *        address: '天堂路1号'
 *     }, {
 *        name: 'andrew',
 *        tel: '888',
 *        address: '天堂路1号'
 *     }, {
 *        name: 'andrew',
 *        tel: '888',
 *        address: '天堂路1号'
 *     }]
 * })
 * @create 2014-05-08
 */

(function (window, undefined) {
    'use strict';
    window.CRUDTable = Backbone.View.extend({

        /**
         * 初始化
         */
        initialize: function (options) {
            this.data = options.data;
            this.name = options.name;
            this.columns = options.columns;
            this.editable = options.editable;
            this.options = options;
            this._defineView();
            this._createModelFromColumns(options.columns);
            this.listenTo(this.rows, 'add', this.add);
        },

        /**
         * 渲染
         */
        render: function () {
            this.setElement($('<table></table>'));
            this._renderTableHeader();
            this._renderTableBody();
            return this;
        },

        /**
         * 定义并创建Model
         * 创建 Row 和 RowCollection 对于的Model
         */
        _createModelFromColumns: function (columns) {
            //获取每一个表格栏目的默认取值
            var defaultValues = {};
            for (var i = 0, len = columns.length; i < len; i++) {
                var item = columns[i];
                defaultValues[item.name] = item.default === undefined ? '' :
                                            item.default;
            }
            //定义表格每一行的Model
            var RowModel = Backbone.Model.extend({
                defaults: function () {
                    return defaultValues;
                },
                validate: function () {
                    //todo 校验
                }
            });
            var collectionModelCfg = {
                model: RowModel
            };

            //本地存储模式，则使用localStorage进行存储数据
            if (this.options.storage === 'local') {
                var storageKey = 'backbone-storage-crud-table-' + this.options.name;
                collectionModelCfg.localStorage = new Backbone.LocalStorage(storageKey);
            }

            //定义表格列表Model
            var RowCollection = Backbone.Collection.extend(collectionModelCfg);
            this.rows = new RowCollection();
        },

        /**
         * 定义View层
         * 定义Row的View
         */
        _defineView: function () {
            //表格行的View
            var rowViewCfg = {
                tagName: 'tr',
                template: _.template(this._createTemplate()),
                events: {
                    //todo
                    'click .btn-delete' : 'clear'
                },

                //初始化
                initialize: function () {
                    //数据改变，重新渲染
                    this.listenTo(this.model, 'change', this.render);
                    //model删除数据，则界面Remove数据
                    this.listenTo(this.model, 'destroy', this.remove);
                },

                //渲染界面
                render: function () {
                    this.$el.html(this.template(this.model.toJSON()));
                    return this;
                }
            };
            this.RowView = Backbone.View.extend(rowViewCfg);
        },

        _createTemplate: function () {
            var tpl = '',
                columns = this.columns,
                col;
            for (var i = 0, len = columns.length; i < len; i++) {
                col = columns[i];
                tpl += '<td><%=' + col.name + '%></td>';
            }
            return tpl;
        },

        /**
         * 添加记录
         */
        add: function (row) {
            var rowView = new this.RowView({model: row});
            this.$el.append(rowView.render().$el);
        },

        /**
         * 删除记录
         */
        delete: function () {
            //todo
        },

        /**
         * 加载数据
         */
        fetch: function () {
            this.rows.fetch();
        },

        /**
         * 渲染表格头部
         */
        _renderTableHeader: function () {
            this.$el.append($('<caption>' + this.name +'</caption>'));
            var columns = this.columns,
                fragment = document.createDocumentFragment(),
                col,
                $head = $('<thead><tr></tr></thead>');
            for (var i = 0, len = columns.length; i < len; i++) {
                col = columns[i];
                fragment.appendChild($('<th>' + col.displayName + '</th>')[0]);
            }
            $head.append(fragment);
            this.$el.append($head);
        },

        /**
         * 渲染表格主体
         */
        _renderTableBody: function () {
            var data = this.data;
            for (var i = 0, len = data.length, d; i < len; i++) {
                d = data[i];
                this.rows.create(d);
            }
        }
    });
})(window);
