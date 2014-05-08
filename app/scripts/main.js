/*global BackboneCrudTable, $*/


window.BackboneCrudTable = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    init: function () {
        'use strict';
        console.log('Hello from Backbone!');
    }
};

$(document).ready(function () {
    'use strict';
    BackboneCrudTable.init();
});
