/*global BackboneCrudTable, $*/


window.BackboneCrudTable = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    init: function() {
        'use strict';
        var CRUDTable = window.CRUDTable;
        var table = new CrudTable({
            name: '联系人表',
            storage: 'remote',
            editable: true,
            url: 'getlist',
            operators: ['delete', 'edit'],
            api: {
                read: 'getlist'
            },
            parse: function (result) {
                return result.data
            },
            listeners: {
                beforeDelete: function () {
                    return this.model.id;
                }
            },
            columns: [{
                name: 'title',
                displayName: '标题',
                width: 100
            }, {
                name: 'url',
                displayName: '链接地址',
                width: 100
            }, {
                name: 'img',
                displayName: '图片',
                width: 50
            }, {
                name: 'prov',
                displayName: '省份',
                width: 30
            }, {
                name: 'city',
                displayName: '城市',
                width: 30
            }, {
                name: 'fr',
                displayName: '平台',
                width: 40
            }, {
                name: 'crud-buttons',
                displayName: '操作',
                width: 100,
                buttons: [{
                    action: 'delete',
                    text: '删除',
                    iconClass: 'icon-trash'
                }, {
                    action: 'edit',
                    text: '编辑',
                    iconClass: 'icon-edit'
                }, {
                    action: 'save',
                    text: '保存',
                    iconClass: 'icon-checkmark'
                }, {
                    action: 'cancel',
                    text: '取消',
                    iconClass: 'icon-undo'
                }]
            }]
        });

        $('body').append(table.render().el);
        table.fetch();
    }
};

$(document).ready(function() {
    'use strict';
    BackboneCrudTable.init();
});
