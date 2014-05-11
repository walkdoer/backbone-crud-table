// Generated on 2014-04-21 using generator-ucp 0.1.3
//
module.exports = function (grunt) {
    'use strict';
    function readOptionalJSON(filepath) {
        var data = {};
        try {
            data = grunt.file.readJSON(filepath);
        } catch (e) {

        }
        return data;
    }
    var srcHintOptions = readOptionalJSON('.jshintrc');
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */'
        },
        bowercopy: {
            options: {
                clean: true
            },
            src: {
                // Keys are destinations (prefixed with `options.destPrefix`)
                // Values are sources (prefixed with `options.srcPrefix`); One source per destination
                // e.g. 'bower_components/chai/lib/chai.js' will be copied to 'test/js/libs/chai.js'
                files: {
                    'src/libs/zepto.min.js': 'zepto/zepto.min.js',
                }
            },
            tests: {
                options: {
                    destPrefix: 'test/libs'
                },
                files: {
                    'qunit': 'qunit/qunit',
                    'zepto.min.js': 'zepto/zepto.min.js',
                    'underscore.js': 'underscore/underscore.js'
                }
            }
        },
        watch: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['build']
            },
            tpl: {
                files: ['src/tpl/**/*.tpl'],
                tasks: ['tpl']
            }
        },
        tpl: {
            options: {
                base: 'src/tpl'
            },
            tpl: {
                src: ['src/tpl/*.tpl'],
                dest: 'src/js/tpl'
            }
        },
        
        commander: {
            /* 定义要执行的shell语句 */
            copyImage: {
                command: 'cp -r src/images dist/'
            }
        },
        cmd: {
            options: {
                base: 'src/js/',
                shim: {
                    'zepto': 'src/js/libs/zepto.min.js'
                }
            },
            //书签
            bookmark: {
                src: [
                    'src/js/**/*.js',
                    '!src/js/seajs/',
                    '!src/js/peek/'
                ],
                dest: 'compiled/bookmark/'
            },
            //偷偷看
            peek: {
                src: [
                    'src/js/**/*.js',
                    '!src/js/bookmark/'
                ],
                dest: 'compiled/peek/'
            }
        },
        pack: {
            css_bookmark: {
                type: 'css',
                src: [
                    '<%= meta.banner %>',
                    'src/css/reset.css',
                    'src/css/bookmark.css'
                ],
                dest: 'dist/bookmark/bookmark.min.<%= pkg.version %>.css'
            },
            css_peek: {
                type: 'css',
                src: [
                    '<%= meta.banner %>',
                    'src/css/reset.css',
                    'src/css/peek.css'
                ],
                dest: 'dist/peek/peek.min.<%= pkg.version %>.css'
            },
            bookmark: {
                type: 'js',
                options: {
                    base: '<%= cmd.bookmark.dest %>'
                },
                src: [
                    '<%= meta.banner %>',
                    '<%= cmd.bookmark.dest %>seajs/sea.js',
                    '<%= cmd.bookmark.dest %>**/*.js',
                    '!<%= cmd.bookmark.dest %>seajs/sea-debug.js',
                    '!<%= cmd.bookmark.dest %>peek/*.js'
                ],
                ignore: [
                    /*这里输入需要排除的js文件*/
                    '<%= cmd.bookmark.dest %>seajs/*.js'
                ],
                dest: 'dist/bookmark/bookmark.min.<%= pkg.version %>.js'
            },
            peek: {
                type: 'js',
                options: {
                    base: '<%= cmd.peek.dest %>'
                },
                src: [
                    '<%= meta.banner %>',
                    '<%= cmd.peek.dest %>seajs/sea.js',
                    '<%= cmd.peek.dest %>**/*.js',
                    '!<%= cmd.peek.dest %>seajs/sea-debug.js',
                    '!<%= cmd.peek.dest %>bookmark/*.js'
                ],
                ignore: [
                    /*这里输入需要排除的js文件*/
                    '<%= cmd.bookmark.dest %>seajs/*.js'
                ],
                dest: 'dist/peek/peek.min.<%= pkg.version %>.js'
            }
        },
         // -----
        //清除中间结果
        clean: {
            compiled: ['compiled']
        },
        jshint: {
            all: {
                src: [
                    'src/**/*.js'
                ],
                options: {
                    jshintrc: true
                }
            },
            //由于源码已经经过jshint，所以合并之后的文件则不进行检查
            //目前暂时取消
            // dist: {
            //     src: 'dist/com.js',
            //     options: srcHintOptions
            // }
        },
        server: {
            publicDir: './src',
            tplDir: './src/tpl',
            staticMapping: {
                '/public': './src'
            },
            // testPath: '/test',
            port: 5040
        },
        htmlbuild: {

            bookmark: {
                src: './src/tpl/bookmark.html',
                dest: './dist/',
                options: {
                    //beautify: true,
                    //prefix: '//some-cdn',
                    //relative: true,
                    scripts: {
                        main: './dist/bookmark/*.js'
                    },
                    styles: {
                        main: './dist/bookmark/*.css'
                    }
                }
            },
            peek: {
                src: './src/tpl/peek.html',
                dest: './dist/',
                options: {
                    //beautify: true,
                    //prefix: '//some-cdn',
                    //relative: true,
                    scripts: {
                        main: './dist/peek/*.js'
                    },
                    styles: {
                        main: './dist/peek/*.css'
                    }
                }
            }
        }
    });
    grunt.loadTasks('build/tasks');

    //同步bower库的文件到需要的文件夹
    grunt.loadNpmTasks('grunt-bowercopy');
    //jsHint
    grunt.loadNpmTasks('grunt-contrib-jshint');
    //监听文件
    grunt.loadNpmTasks('grunt-contrib-watch');
    //清除文件
    grunt.loadNpmTasks('grunt-contrib-clean');
    //构建html文件
    grunt.loadNpmTasks('grunt-html-build');
    //bower the denpendencies
    grunt.registerTask('bower', 'bowercopy');
    //build project
    grunt.registerTask('build', ['clean', 'cmd', 'pack', 'htmlbuild', 'commander:copyImage']);
    //use this task when under developing
    grunt.registerTask('dev', ['watch', 'server']);
    //test
    grunt.registerTask('test', ['jshint']);
    //default task, when you run command 'grunt'
    grunt.registerTask('default', ['bower', 'build', 'dev', 'server']);
};
