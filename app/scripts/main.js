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
            storage: 'local',
            columns: [{
                name: 'address',
                displayName: '地址'
            }, {
                name: 'tel',
                displayName: '电话'
            }, {
                name: 'name',
                displayName: '姓名'
            }],
            data: [{
                name: 'andrew',
                tel: '888',
                address: '天堂路1号'
            }, {
                name: 'andrew',
                tel: '888',
                address: '天堂路1号'
            }, {
                name: 'andrew',
                tel: '888',
                address: '天堂路1号'
            }]
        });

        $('body').append(table.render().el);
    }
};

$(document).ready(function() {
    'use strict';
    BackboneCrudTable.init();
});
