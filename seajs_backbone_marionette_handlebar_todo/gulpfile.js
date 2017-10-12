var gulp = require('gulp'),
    yargs = require('yargs').argv, //获取运行gulp命令时附加的命令行参数
    clean = require('gulp-clean'), //清理文件或文件夹
    replace = require('gulp-replace-task'), //对文件中的字符串进行替换
    browserSync = require('browser-sync'), //启动静态服务器
    transport = require("gulp-seajs-transport"), //对seajs的模块进行预处理：添加模块标识
    concat = require("gulp-seajs-concat"), //seajs模块合并
    uglify = require('gulp-uglify'), //js压缩混淆
    merge = require('merge-stream'), //合并多个流

    handlebars = require('gulp-handlebars'), //对模板引擎进行编译
    wrap = require('gulp-wrap'),
    declare = require('gulp-declare'),

    src = 'src',
    dist = 'dist',
    // CONTEXT_PATH = 'my-gulp-project/',
    CONTEXT_PATH = '',
    replace_patterns = [{
        match: 'CONTEXT_PATH',
        replacement: yargs.r ? CONTEXT_PATH : ''
    }];

//构建handlebar模板
gulp.task('templates', function() {
    gulp.src(src + '/templates/*.handlebars')
        .pipe(handlebars({
            handlebars: require('handlebars')
        }))
        .pipe(wrap('define(function(require,exports,module){ var Handlebars = require(\'handlebars\'); return Handlebars.template(<%= contents %>)})'))
        // .pipe(declare({
        //     // namespace: 'MyApp.templates',
        //     namespace: '',
        //     noRedeclare: true, // Avoid duplicate declarations 
        // }))
        // .pipe(concat('templates.js'))
        .pipe(gulp.dest(src + '/js/templates/'))
        .pipe(browserSync.stream());
});
//清理构建目录
gulp.task('clean', function() {
    return gulp.src(dist, { read: false })
        .pipe(clean());
});


var htmlmin = require('gulp-htmlmin');

gulp.task('html', function() {
    gulp.src(src + '/html/**/*')
        .pipe(htmlmin({
            collapseWhitespace: true, //压缩html
            collapseBooleanAttributes: true, //省略布尔属性的值
            removeComments: true, //清除html注释
            removeEmptyAttributes: true, //删除所有空格作为属性值
            removeScriptTypeAttributes: true, //删除type=text/javascript
            removeStyleLinkTypeAttributes: true, //删除type=text/css
            minifyJS: true, //压缩页面js
            minifyCSS: true //压缩页面css
        }))
        .pipe(replace({
            patterns: replace_patterns
        }))
        .pipe(gulp.dest(dist + '/html/'))
        .pipe(browserSync.stream());
});

// //拷贝src/html到dist/html
// gulp.task('html', function() {
//     return gulp.src(src + '/html/**/*')
//         .pipe(replace({
//             patterns: replace_patterns
//         }))
//         .pipe(gulp.dest(dist + '/html/'))
//         .pipe(browserSync.stream());
// });
// //拷贝模板文件
// gulp.task('tpl', function() {
//     return gulp.src(src + '/templates/**/*')
//         .pipe(replace({
//             patterns: replace_patterns
//         }))
//         .pipe(gulp.dest(dist + '/templates/'))
//         .pipe(browserSync.stream());
// });
//拷贝样式文件
gulp.task('css', function() {
    return gulp.src(src + '/assets/**/*')
        .pipe(replace({
            patterns: replace_patterns
        }))
        .pipe(gulp.dest(dist + '/assets/'))
        .pipe(browserSync.stream());
});
//拷贝模式：src/js到dist/js
gulp.task('script_copy', function() {
    return gulp.src(src + '/js/**/*', { base: src + '/js' })
        .pipe(replace({
            patterns: replace_patterns
        }))
        .pipe(gulp.dest(dist + '/js'))
        .pipe(browserSync.stream());
});

//seajs合并模式
gulp.task("seajs", function() {
    return merge(
        gulp.src(src + '/js/!(lib)/**/*.js', { base: src + '/js' })
        .pipe(transport())
        .pipe(concat({
            base: src + '/js'
        }))
        .pipe(replace({
            patterns: replace_patterns
        }))
        .pipe(gulp.dest(dist + '/js')),

        gulp.src([src + '/js/lib/**/*.js', src + '/js/common.js'], { base: src + '/js' })
        .pipe(replace({
            patterns: replace_patterns
        }))
        .pipe(gulp.dest(dist + '/js'))
    );
});

//js压缩混淆，条件是生产环境下才会真正的压缩混淆
//另外它依赖于seajs或script_copy任务：
//生产环境执行seajs任务，开发环境执行script_copy任务
gulp.task('script_uglify', [yargs.r ? 'seajs' : 'script_copy'], function(cb) {
    if (yargs.r) {
        return gulp.src([
                dist + '/js/lib/**/*.js',
                dist + '/js/app/**/*.js'
            ], { base: dist + '/js' })
            .pipe(uglify({
                mangle: {
                    except: ['require', 'exports', 'module'] //这几个变量不能压缩混淆，否则会引发seajs的一些意外问题
                }
            }).on('error', function(err) {
                console.error('Error in compress task', err.toString());
            }))
            .pipe(gulp.dest(dist + '/js_tmp'));
    } else {
        cb();
    }
});

//前面一个任务将压缩后的代码都放到了dist/js_tmp下
//这个任务将压缩后的代码从dist/js_tmp还原到dist/js
gulp.task('script_restore', ['script_uglify'], function(cb) {
    if (yargs.r) {
        return gulp.src([
                dist + '/js_tmp/**/*'
            ], { base: dist + '/js_tmp' })
            .pipe(gulp.dest(dist + '/js'))
            .pipe(browserSync.stream());
    } else {
        cb();
    }
});

//最终的script任务
gulp.task('script', ['script_restore'], function(cb) {
    if (yargs.r) {
        return gulp.src([dist + '/js_tmp'], { read: false })
            .pipe(clean());
    } else {
        cb();
    }
});

gulp.task('build', ['clean'], function() {
    return gulp.start('script', 'html', 'css', 'templates');
});

gulp.task('watch', function() {
    gulp.watch(src + '/js/**/*', ['script']);
    gulp.watch(src + '/html/**/*', ['html']);
    gulp.watch(src + '/assets/**/*', ['css']);
    gulp.watch(src + '/templates/**/*', ['templates']);
});

gulp.task('server', function() {
    yargs.p = yargs.p || 8080;
    browserSync.init({
        server: {
            baseDir: "./"
        },
        ui: {
            port: yargs.p + 1,
            weinre: {
                port: yargs.p + 2
            }
        },
        port: yargs.p,
        startPath: 'dist/html/index.html'
    });
    // gulp.start('script', 'html', 'css');
    gulp.watch(src + "/**/*.*").on('change', function() {
        browserSync.reload
    });
});


/**
 * 参数说明
 * -w: 监听文件改变
 * -s: 启动browserAsync
 * -p: 指定端口
 * -r: 需要更新github上的demo时才会用到的参数
 *
 * 常用命令如下
 * 构建：gulp
 * 构建完，监听文件改变：gulp -w
 * 构建并启动browserAsync: gulp -s
 * 通过指定端口启动browserAsync: gulp -s -p=8081
 * 构建启动browserAsync，同时启动监听： gulp -sw
 */
gulp.task('default', ['build'], function() {
    if (yargs.s) {
        gulp.start('server');
    }

    if (yargs.w) {
        gulp.start('watch');
    }
});