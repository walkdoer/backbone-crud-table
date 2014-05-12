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
    window.CrudTable = Backbone.View.extend({
            
        btnGroup: '<a class="crud-btn crud-h-btn crud-add">添加</a><a class="crud-btn crud-h-btn crud-clear-all">清空所有数据</a>',
        /**
         * 初始化
         */
        initialize: function (options) {
            Backbone.emulateHTTP = options.emulateHTTP;
            this.data = options.data;
            this.name = options.name;
            this.columns = options.columns;
            this.className = options.className;
            this.editable = options.editable;
            this.autoLoad = options.autoLoad === undefined ? true : options.autoLoad;
            this.options = options;
            this._defineView();
            this._createModelFromColumns(options.columns);
            this.listenTo(this.rowList, 'add', this.add);
            this.listenTo(this.rowList, 'remove', this.checkTableCount);
        },

        /**
         * 渲染
         */
        render: function () {
            var that = this;
            this.setElement($('<table></table>'));
            this.$el.addClass(this.className);
            this._renderTableHeader();
            that._renderTableBody();
            this.$loading = $('<div class="crud-mask">loading</div>');
            this.$el.append(this.$loading);
            this.autoLoad && this.fetch();
            return this;
        },

        events: {
            //清空所有数据
            'click .crud-clear-all': 'clearAll',
            'click .crud-add': 'addNew'
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
                defaultValues[item.name] = item.defaultValue === undefined ? '' :
                                            item.defaultValue;
            }
            //定义表格每一行的Model
            var RowModel = Backbone.Model.extend({
                idAttribute: this.options.idAttribute,
                defaults: function () {
                    return defaultValues;
                },
                api: this.options.api,
                sync: function(method, model, options) {
                    options = options || {};
                    options.wait = true;
                    options.url = model.api[method.toLowerCase()];
                    return Backbone.sync.apply(this, arguments);
                },
                validate: function () {
                    //todo 校验
                }
            });
            this.RowModel = RowModel;
            var collectionModelCfg = {
                model: RowModel,
                api: this.options.api,
                idAttribute: this.options.idAttribute,
                parse: this.options.parse,
                sync: function(method, model, options) {
                    options = options || {};
                    options.url = model.api[method.toLowerCase()];
                    return Backbone.sync.apply(this, arguments);
                }
            };

            //本地存储模式，则使用localStorage进行存储数据
            var storage = this.options.storage;
            if (storage === 'local') {
                var storageKey = 'backbone-storage-crud-table-' + this.options.name;
                collectionModelCfg.localStorage = new Backbone.LocalStorage(storageKey);
            } else if (storage === 'remote') {
                collectionModelCfg.url = this.options.url;
            } else {
                throw new Error('数据库option.storage配置出错,取值是remote或者local');
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
            var table = this;
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
                    this.addingNew = options.addingNew;
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
                    var that = this;
                    Backbone.emulateJSON = true;
                    this.model.destroy({
                        data: table.options.params.delete(this.model),
                        success: function() {
                            that.trigger('deleteSuccess', that.model);
                        },
                        error: function() {
                            that.trigger('deleteError', that.model);
                        }
                    });
                },

                //保存
                save: function () {
                    var that = this;
                    Backbone.emulateJSON = false;
                    this.model.save(table.options.params.save(this._getValues()), {
                        success: function () {
                            that.trigger('addSuccess', that.model);
                        },
                        error: function () {
                            that.trigger('addError', that.model);
                        }
                    });
                    this.addingNew = false;
                    this._editing(false);
                },

                //取消
                cancel: function () {
                    this._editing(false);
                    if (this.addingNew) {
                        this.model.destroy();
                    }
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
                colEditable,
                defaultOperator = {
                    edit: '编辑',
                    delete: '删除',
                    cancel: '取消',
                    save: '保存'
                },
                col;
            for (var i = 0, len = columns.length, content; i < len; i++) {
                col = _.extend({}, {hidden: false, editable: true}, columns[i]);
                if (col.hidden) {
                    continue;
                }
                if (editable && col.editable) {
                    content = '<label><%=' + col.name + '%></label><input name="' + col.name+ '" value="<%=' + col.name + '%>"/>';
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
            //添加新的记录，则清空没有数据的提示
            if (this.rowList.length === 1) {
                this.$el.find('tbody').empty();
            }
            var rowView = new this.RowView({model: row, columns: this.columns, addingNew: this.addingNew});
            //this.listenTo(rowView, 'delete', this.clear);
            this.$el.find('tbody').append(rowView.render().$el);
            if (this.addingNew) {
                this.curAdd = rowView;
                this.addingNew = false;
            }
        },

        /**
         * 添加新记录
         */
        addNew: function () {
            var that = this,
                rowView = new this.RowView({model: new this.RowModel(), columns: this.columns});
            this.$el.append(rowView.render().$el);
            rowView.edit();
            this.listenTo(rowView, 'addSuccess', function (model) {
                that.rowList.add(model);
            });
            this.listenTo(rowView, 'addError', function () {
                alert('添加失败');
            });
            //this.addingNew = true;
            //this.rowList.create();
            //this.curAdd.edit();
        },


        //删除
        //clear: function (model) {
        //    this.rowList.remove(model);
        //},

        //删除全部
        clearAll: function () {
            _.invoke(this.rowList.toArray(), 'destroy');
        },

        /**
         * 加载数据
         */
        fetch: function () {
            var that = this;
            this._loading(true);
            this.rowList.fetch({
                success: function (e, data) {
                    that._loading(false);
                    that._renderTableFooter();
                    that.checkTableCount();
                },
                error: function (e) {
                    //todo
                    that._loading(false);
                }
            });
        },

        checkTableCount: function () {
            if (this.rowList.length === 0) {
                this.$el.find('tbody').append($('<tr class="crud-no-data"><td colspan="' +
                    (this.columns.length + 1) +'">没有数据</td></tr>'));
            }
        },

        /**
         * 渲染表格头部
         */
        _renderTableHeader: function () {
            this.$el.append($('<caption>' + this.name + this.btnGroup + '</caption>'));
            var columns = this.columns,
                fragment = document.createDocumentFragment(),
                col,
                $head = $('<thead><tr></tr></thead>');
            for (var i = 0, len = columns.length; i < len; i++) {
                col = _.extend({}, {hidden: false}, columns[i]);
                if (col.hidden) {
                    continue;
                }
                col = columns[i];
                fragment.appendChild($('<th>' + col.displayName + '</th>')[0]);
            }
            if (this.options.operators) {
                fragment.appendChild($('<th>操作</th>')[0]);
            }
            $head.append(fragment);
            this.$el.append($head);
        },

        _renderTableFooter: function () {
            this.$el.append($('<tfoot><tr><td colspan="' + (this.columns.length + 1) +'">'
                        + this.btnGroup + '</td></tr></tfoot>'));
        },

        /**
         * 渲染表格主体
         */
        _renderTableBody: function (e, result) {
            this.$el.append('<tbody>');
        },

        /**
         * 切换界面的loading状态
         */
        _loading: function (isLoading) {
            this.$el.find('.crud-mask')[isLoading ? 'show' : 'hide']();
        }
    });
})(window);
