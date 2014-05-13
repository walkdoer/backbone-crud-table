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

        /**
         * 创建全局按钮
         */
    var _createButtons = function (buttons) {
        var defaultCfg = {
                iconClass: '',
                buttonClass: '',
                text: ''
            },
            defaultButtonText = {
                edit: '编辑',
                refresh: '刷新',
                create: '添加',
                delete: '删除',
                cancel: '取消',
                save: '保存'
            },
            fragment = document.createDocumentFragment(),
            Btn = _.template('<a class="crud-btn crud-<%=action%> <%=buttonClass%>"><i class="<%=iconClass%>"></i><%=text%></a>');
        _.each(buttons, function (btn) {
            if(!btn.text) {
                btn.text = defaultButtonText[btn.action];
            }
            btn = _.extend({}, defaultCfg, btn);
            fragment.appendChild($(Btn(btn))[0]);
        });
        return fragment;
    };
    window.CrudTable = Backbone.View.extend({

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
            this.setElement($('<table class="crud-table"></table>'));
            this.$el.addClass(this.className);
            this._renderTableHeader();
            this._renderTableBody();
            this._renderTableFooter();
            this.$loading = $('<div class="crud-mask">loading</div>');
            this.$el.append(this.$loading);
            var btnCfg;
            if ((btnCfg = this.options.buttonCfg)) {
                this.$el.find('.crud-btn').addClass(btnCfg.buttonClass);
            }
            return this;
        },

        events: {
            //清空所有数据
            'click .crud-clear-all': 'clearAll',
            'click .crud-create': 'addNew',
            'click .crud-refresh': 'refresh'
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
                parse: function (result) {
                    //兼容返回结果不是标准的backbone返回结果
                    if (result.id !== undefined) {
                        return result;
                    } else {
                        return result.data;
                    }
                },
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
                sync: function(method, model, options) {
                    options = options || {};
                    options.url = model.api[method.toLowerCase()];
                    return Backbone.sync.apply(this, arguments);
                }
            };
            
            var parse = this.options.parse;
            if (parse) {
                collectionModelCfg.parse = parse;
            }

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
                    if (table.options.buttonCfg) {
                        this.rowButtonControl = table.options.buttonCfg.display || emptyFun;
                    }
                    //数据改变，重新渲染
                    this.listenTo(this.model, 'change', this.render);
                    //model删除数据，则界面Remove数据
                    this.listenTo(this.model, 'destroy', this.remove);
                },

                //渲染界面
                render: function () {
                    this.$el.html(this.template(this.model.toJSON()));
                    var cfg;
                    if ((cfg = table.options.buttonCfg)) {
                        this.$el.find('.crud-row-buttons').append(_createButtons(cfg.rowButtons));
                    }
                    this.$labels = this.$el.find('label');
                    this.$inputs = this.$el.find('input').hide();
                    //让用户自定义其行按钮的控制
                    this.rowButtonControl && this.rowButtonControl();
                    this.displayButton(['save', 'cancel'], false);
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
                    var newAttrs =  table.options.params.save(this._getValues()),
                        url = table.options.api[this.model.isNew() ? 'create' : 'update'];
                    //Backbone.emulateJSON = false;
                    Backbone.ajax({
                        method: 'POST',
                        url: url,
                        data: _.extend({}, that.model.attributes, newAttrs),
                        success: function (resp) {
                            if (resp.success) {
                                that.model.set(_.extend({}, that.model.attributes, resp.data));
                                that.trigger('saveSuccess', that.model);
                                that._editing(false);
                            } else {
                                that.trigger('saveError', resp.msg);
                            }
                        },
                        error: function () {
                            that.trigger('saveError', that.model);
                        }
                    });
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
                displayButton: function (btns, isShow) {
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
                    this.displayButton(['edit', 'delete'], !isEditing);
                    this.displayButton(['save', 'cancel'], isEditing);
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
                buttonCfg = this.options.buttonCfg || {},
                buttons = buttonCfg.rowButtons,
                colEditable,
                style,
                defaultButtons = {
                },
                col;
            for (var i = 0, len = columns.length, content; i < len; i++) {
                col = _.extend({}, {hidden: false, editable: true}, columns[i]);
                if (editable && col.editable) {
                    content = '<label><%=' + col.name + '%></label><input type="text" name="' + col.name+ '" value="<%=' + col.name + '%>"/>';
                } else {
                    content = '<%=' + col.name + '%>';
                }
                style = col.hidden ? 'display: none;' : '';
                tpl += '<td style="' + style + '">' + content + '</td>';
            }
            var buttonCfg = this.options.buttonCfg;
            if (buttonCfg && buttonCfg.rowButtons) {
                tpl += '<td class="crud-row-buttons"></td>';
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
            this.listenTo(rowView, 'saveError', function (msg) {
                alert('失败:' + msg);
            });
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
            this.listenTo(rowView, 'saveSuccess', function (model) {
                that.rowList.add(model);
                rowView.remove();
            });
            this.listenTo(rowView, 'saveError', function (msg) {
                alert('失败:' + msg);
            });
            //this.addingNew = true;
            //this.rowList.create();
            //this.curAdd.edit();
        },


        //删除
        refresh: function () {
            this.fetch();
        },

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
                    that.checkTableCount();
                    that._loading(false);
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
            } else {
                this.$el.find('.crud-no-data').remove();
            }
        },

        /**
         * 渲染表格头部
         */
        _renderTableHeader: function () {
            var $caption = $('<caption>' + this.name + '</caption>');
            if (this.options.buttonCfg) {
                $caption.append(_createButtons(this.options.buttonCfg.buttons));
            }
            this.$el.append($caption);
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
            var buttonCfg = this.options.buttonCfg;
            if (buttonCfg && buttonCfg.buttons) {
                fragment.appendChild($('<th>操作</th>')[0]);
            }
            $head.find('tr').append(fragment);
            this.$el.append($head);
        },

        _renderTableFooter: function () {
            this.$el.append($('<tfoot><tr><td colspan="' + (this.columns.length + 1) +'"></td></tr></tfoot>'));
        },

        /**
         * 渲染表格主体
         */
        _renderTableBody: function (e, result) {
            this.$el.append('<tbody>');
            this.checkTableCount();
        },

        /**
         * 切换界面的loading状态
         */
        _loading: function (isLoading) {
            var $tbody = this.$el.find('tbody');
            var height = $tbody.height(),
                width = $tbody.width();
            this.$el.find('.crud-mask').css({
                width: width,
                height: height,
                'margin-top': -height,
                'line-height': height + 'px'
            })[isLoading ? 'show' : 'hide']();
        }
    });
})(window);
