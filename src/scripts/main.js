/*global BackboneCrudTable, $*/


window.BackboneCrudTable = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    init: function() {
        'use strict';
        var CRUDTable = window.CRUDTable;
        var table = new CRUDTable({
            name: '联系人表',
            storage: 'remote',
            editable: true,
            url: 'getlist',
            operators: ['delete', 'edit'],
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
//             data: [{
//                 name: 'andrew',
//                 tel: '888',
//                 address: '天堂路1号'
//             }, {
//                 name: 'andrew',
//                 tel: '888',
//                 address: '天堂路1号'
//             }, {
//                 name: 'andrew',
//                 tel: '888',
//                 address: '天堂路1号'
//             }]
        });

        $('body').append(table.render().el);
    }
};

$(document).ready(function() {
    'use strict';
    BackboneCrudTable.init();
});
