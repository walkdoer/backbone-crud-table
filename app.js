'use strict';

var path = require('path');

module.exports = function(config) {
    return {
        '/getlist': {
            get: function(req, res) {
                return {
                    api_version: "1.0.0", //版本号
                    data: [{
                        id: 1,
                        type: 0, //是什么资源, 0：H资源；1：小说；2：视频；3：漫画；4：美女
                        title: "与加藤鹰老师看日出日落",
                        url: "http://m.baidu.com",
                        img: "http://img0.bdstatic.com/img/image/shouye/mvxqxmz.jpg",
                        prov: "广东",
                        city: "广州",
                        fr: "android",
                        num: "8867"
                    }, {
                        id: 2,
                        type: 1, //是什么资源, 0：H资源；1：小说；2：视频；3：漫画；4：美女
                        title: "与妇产科老师看日出日落",
                        url: "http://m.baidu.com",
                        img: "http://img0.bdstatic.com/img/image/shouye/mvxqxmz.jpg",
                        prov: "广东",
                        city: "广州",
                        fr: "android",
                        num: "8867"
                    }, {
                        id: 3,
                        type: 2, //是什么资源, 0：H资源；1：小说；2：视频；3：漫画；4：美女
                        title: "与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落与高老湿看日出日落",
                        url: "http://m.baidu.comcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcomcom",
                        img: "url",
                        prov: "广东",
                        city: "广州",
                        fr: "android",
                        num: "8867"
                    }, {
                        id: 4,
                        type: 0, //是什么资源, 0：H资源；1：小说；2：视频；3：漫画；4：美女
                        title: "与加藤鹰老师看日出日落",
                        url: "http://m.baidu.com",
                        img: "url",
                        prov: "广东",
                        city: "广州",
                        fr: "android",
                        num: "8867"
                    }, {
                        id: 5,
                        type: 1, //是什么资源, 0：H资源；1：小说；2：视频；3：漫画；4：美女
                        title: "与妇产科老师看日出日落",
                        url: "http://m.baidu.com",
                        img: "url",
                        prov: "广东",
                        city: "广州",
                        fr: "android",
                        num: "8867"
                    }, {
                        id: 6,
                        type: 4, //是什么资源, 0：H资源；1：小说；2：视频；3：漫画；4：美女
                        title: "与高老湿看日出日落",
                        url: "http://m.baidu.com",
                        img: "url",
                        prov: "广东",
                        city: "广州",
                        fr: "android",
                        num: "8867"
                    }, {
                        id: 7,
                        type: 0, //是什么资源, 0：H资源；1：小说；2：视频；3：漫画；4：美女
                        title: "与加藤鹰老师看日出日落",
                        url: "http://m.baidu.com",
                        img: "url",
                        prov: "广东",
                        city: "广州",
                        fr: "android",
                        num: "8867"
                    }, {
                        id: 8,
                        type: 2, //是什么资源, 0：H资源；1：小说；2：视频；3：漫画；4：美女
                        title: "与妇产科老师看日出日落",
                        url: "http://m.baidu.com",
                        img: "url",
                        prov: "广东",
                        city: "广州",
                        fr: "android",
                        num: "8867"
                    }, {
                        id: 9,
                        type: 4, //是什么资源, 0：H资源；1：小说；2：视频；3：漫画；4：美女
                        title: "与高老湿看日出日落",
                        url: "http://m.baidu.com",
                        img: "http://img0.bdstatic.com/img/image/shouye/mvxqxmz.jpg",
                        prov: "广东",
                        city: "广州",
                        fr: "android",
                        num: "8867"
                    }, {
                        id: 4,
                        type: 0, //是什么资源, 0：H资源；1：小说；2：视频；3：漫画；4：美女
                        title: "与高老湿看日出日落",
                        url: "http://m.baidu.com",
                        img: "http://img0.bdstatic.com/img/image/shouye/mvxqxmz.jpg",
                        prov: "广东",
                        city: "广州",
                        fr: "iphone",
                        num: "8867"
                    }, {
                        id: 5,
                        type: 0, //是什么资源, 0：H资源；1：小说；2：视频；3：漫画；4：美女
                        title: "与高老湿看日出日落",
                        url: "http://m.baidu.com",
                        img: "http://img0.bdstatic.com/img/image/shouye/mvxqxmz.jpg",
                        prov: "广东",
                        city: "广州",
                        fr: "android",
                        num: "8867"
                    }],
                    hotpost:[
                      {
                        title:'台湾佬网站',
                        url:'http://m.baidu.com'
                      },
                                            {
                        title:'美国佬网站',
                        url:'http://m.baidu.com'
                      },
                                            {
                        title:'日本佬网站',
                        url:'http://m.baidu.com'
                      }
                    ]
                };
            }
        }
    };
};
