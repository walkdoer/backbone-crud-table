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
            columns: [{
                name: 'title',
                displayName: '标题'
            }, {
                name: 'url',
                displayName: '链接地址'
            }, {
                name: 'img',
                displayName: '图片'
            }, {
                name: 'prov',
                displayName: '省份'
            }, {
                name: 'city',
                displayName: '城市'
            }, {
                name: 'fr',
                displayName: '平台'
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
