/**
 * CRUD Table
 *
 * 提供CRUD功能的Table，基于Backbone, 提供local和remote的增删改查功能。
 *
 * 主要配置项
 *
 *     name: {String} 表格名称
 *     editable: {Boolean} 是否可编辑，默认为false，不可编辑
 *     columns: {Array} 栏目配置
 *     data: {Array} 提供表格数据
 *     api: {object} 表格remote接口配置
 *
 * 例子
 * var crudTable = new CRUDTable({
 *     name: '联系人表',
 *     storage: 'local',
 *     operators: [‘delete', 'edit'],
 *     editable: true,  
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
            this.autoLoad = options.autoLoad === undefined ? true : options.autoLoad;
            this.options = options;
            this._defineView();
            this._createModelFromColumns(options.columns);
            this.listenTo(this.rowList, 'add', this.add);
        },

        /**
         * 渲染
         */
        render: function () {
            this.setElement($('<table></table>'));
            this._renderTableHeader();
            this.autoLoad && this.rowList.fetch();
            return this;
        },

        events: {
            //清空所有数据
            'click .crud-clear-all': 'clearAll'
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
            this.rowList = new RowCollection();
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
                    'click .crud-delete' : 'clear',
                    'click .crud-edit': 'edit',
                    'click .crud-save': 'save',
                    'click .crud-cancel': 'cancel'
                },

                //初始化
                initialize: function (options) {
                    this.options = options;
                    //数据改变，重新渲染
                    this.listenTo(this.model, 'change', this.render);
                    //model删除数据，则界面Remove数据
                    this.listenTo(this.model, 'destroy', this.remove);
                },

                //渲染界面
                render: function () {
                    this.$el.html(this.template(this.model.toJSON()));
                    this.$labels = this.$el.find('label');
                    this.$inputs = this.$el.find('input').hide();
                    this._displayBtns(['save', 'cancel'], false);
                    return this;
                },

                //删除
                clear: function () {
                    this.model.destroy();
                },
                
                //保存
                save: function () {
                    this.model.save(this._getValues());
                    this._editing(false);
                },
                
                //取消
                cancel: function () {
                    this._editing(false);    
                },
                
                //编辑
                edit: function () {
                    this._editing(true);
                },
                
                //控制按钮显示与隐藏
                _displayBtns: function (btns, isShow) {
                    var that = this;
                    _.each(btns, function (btn) {
                       that.$el.find('.crud-' + btn)[isShow ? 'show' : 'hide'](); 
                    });
                },
                
                //获取value
                _getValues: function () {
                    var that = this,
                        columns = this.options.columns,
                        data = {};
                    _.each(columns, function (col) {
                        data[col.name] = that.$el.find('input[name=' + col.name +']').val();
                    });
                    return data;
                },
                
                //切换为编辑状态
                _editing: function (isEditing) {
                    this.$el[isEditing ? 'addClass' : 'removeClass']('editing');
                    this._displayBtns(['edit', 'delete'], !isEditing);
                    this._displayBtns(['save', 'cancel'], isEditing);
                    this.$labels[isEditing ? 'hide' : 'show']();
                    //显示所有的编辑框
                    this.$inputs[isEditing ? 'show' : 'hide']();
                    //聚焦在第一个编辑框
                    isEditing && this.$inputs.eq(0).focus();
                }
            };
            this.RowView = Backbone.View.extend(rowViewCfg);
        },

        _createTemplate: function () {
            var tpl = '',
                columns = this.columns,
                editable = this.editable,
                operators = this.options.operators,
                defaultOperator = {
                    edit: '编辑',
                    delete: '删除',
                    cancel: '取消',
                    save: '保存'
                },
                col;
            for (var i = 0, len = columns.length, content; i < len; i++) {
                col = columns[i];
                if (editable) {
                    content = '<label><%=' + col.name + '%></label><input name="' + col.name+ '" value="<%=' + col.name + '%>"/>'
                } else {
                    content = '<%=' + col.name + '%>';
                }
                tpl += '<td>' + content + '</td>';
            }
            if (operators) {
                tpl += '<td>';
                _.each(operators, function (val) {
                    if (typeof val === 'string') {
                        //使用默认的文案
                        tpl +=  '<a class="crud-btn crud-' + val + '">' + (defaultOperator[val] || '') + '</a>';
                    }
                });
                tpl +=  '<a class="crud-btn crud-save">' + defaultOperator.save + '</a>';
                tpl +=  '<a class="crud-btn crud-cancel">' + defaultOperator.cancel + '</a>';
                tpl += '</td>';
            }
            return tpl;
        },

        /**
         * 添加记录
         */
        add: function (row) {
            var rowView = new this.RowView({model: row, columns: this.columns});
            this.$el.append(rowView.render().$el);
        },

        
        clearAll: function () {
            _.invoke(this.rowList.toArray(), 'destroy');
        },
        
        /**
         * 加载数据
         */
        fetch: function () {
            var that = this;
            this.rowList.fetch({
                success: function (e, data) {
                    that._renderTableBody(data);
                },
                error: function (e) {
                    //todo
                }
            });
        },

        /**
         * 渲染表格头部
         */
        _renderTableHeader: function () {
            this.$el.append($('<caption>' + this.name + '<a class="crud-btn crud-clear-all">清空所有数据</a></caption>'));
            var columns = this.columns,
                fragment = document.createDocumentFragment(),
                col,
                $head = $('<thead><tr></tr></thead>');
            for (var i = 0, len = columns.length; i < len; i++) {
                col = columns[i];
                fragment.appendChild($('<th>' + col.displayName + '</th>')[0]);
            }
            if (this.options.operators) {
                fragment.appendChild($('<th>操作</th>')[0]);
            }
            $head.append(fragment);
            this.$el.append($head);
        },

//         /**
//          * 渲染表格主体
//          */
//         _renderTableBody: function (e, result) {
//             var data = result;
//             for (var i = 0, len = data.length, d; i < len; i++) {
//                 d = data[i];
//                 this.rowList.create(d);
//             }
//         }
    });
})(window);
