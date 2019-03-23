'use strict';
// Определим необходимые инструменты
const dirs         = {
						source: 'src',  // папка с исходниками (путь от корня проекта)
						build: 'build', // папка на продакшен (путь от корня проекта)
					};
const syntax       = 'sass'; // Syntax: sass or scss;

const gulp         = require('gulp');
const sass         = require('gulp-sass'); //Подключаем Sass пакет
const rename       = require('gulp-rename'); // Подключаем библиотеку для переименования файлов
const sourcemaps   = require('gulp-sourcemaps'); //Подключаем встроенные исходные карты
const postcss      = require('gulp-postcss'); // Для передачи CSS через несколько плагинов, но разбирать CSS только один раз.
const autoprefixer = require('autoprefixer'); // Подключаем библиотеку для автоматического добавления префиксов
const mqpacker     = require('css-mqpacker'); // Для сортировки медиа запросов в CSS и упаковки в один
const sortCSSmq    = require('sort-css-media-queries'); // Метод сортировки медиа запросов в CSS
const replace      = require('gulp-replace'); // Плагин замены строк
const del          = require('del'); // Подключаем библиотеку для удаления файлов и папок
const browserSync  = require('browser-sync').create(); // Подключаем Browser Sync
const ghPages      = require('gulp-gh-pages'); // Для отправки на github pages
const newer        = require('gulp-newer'); // Для прохождения только по новым файлам
const imagemin     = require('gulp-imagemin'); // Минификация PNG, JPEG, GIF и SVG
const pngquant     = require('imagemin-pngquant'); // Сжатие PNG
const uglify       = require('gulp-uglify'); // Минификация и сжатие JS
const concat       = require('gulp-concat'); // Конкатенация всех файлов в один
const cheerio      = require('gulp-cheerio'); // Манипуляция HTML и XML с помощью cheerio (core JQ for the server)
const svgstore     = require('gulp-svgstore'); // Объединить svg-файлы в один с элементами <symbol>
const svgmin       = require('gulp-svgmin'); // Минификация и сжатие SVG
const notify       = require('gulp-notify'); // Плагин уведомлений для GULP
const plumber      = require('gulp-plumber'); // Плагин для продолжения работы GULP при ошибке
const cleanCSS     = require('gulp-clean-css'); // Для минификации CSS файлов c clean-css
const cssnano      = require('gulp-cssnano'); // Для минификации CSS файлов c cssnano
const include      = require('gulp-file-include'); // Include в файлы @@include options - type: JSON
const htmlbeautify = require('gulp-html-beautify'); // Красивый код HTML
const spritesmith  = require('gulp.spritesmith'); // Преобразование набора изображений в спрайты
const merge        = require('merge-stream'); // Объединить (чередовать) кучу потоков
const buffer       = require('vinyl-buffer'); // Конвертировать потоковые виниловые файлы в буферы
const rsync        = require('gulp-rsync'); // Для загрузки на сервер по FTP
const cache        = require('gulp-cache'); // Подключаем библиотеку кеширования

// ФУНКЦИЯ: Компиляция препроцессора SASS or SCSS и стилей на продакшен MAIN
function styles_build() {
	return gulp.src(dirs.source + '/' + syntax + '/**/main.' + syntax)		// какой файл компилировать (путь из константы)
	// .pipe(include())		// подключим include-ы
	.pipe(plumber({ errorHandler: onError }))		// продолжаем работу при ошибках
	.pipe(sourcemaps.init())		// инициируем карту кода
	.pipe(sass({ outputStyle: 'expanded' }).on('error', notify.onError()))		// компилируем (or 'compressed')
	.pipe(postcss([ autoprefixer({		// делаем постпроцессинг
		browsers: ['> 0.1%', 'last 15 versions'],
		cascade: true,
		grid: 'autoplace'		// для IE
		}),		// автопрефиксирование
		mqpacker({ sort: sortCSSmq.desktopFirst }),		// объединение медиавыражений (sortCSSmq or sortCSSmq.desktopFirst)
	]))
	.pipe(rename('main.min.css'))		// переименовываем
	// .pipe(cleanCSS({		// сжимаем
	// 	level: {
	// 		1: {
	// 			specialComments: 'all'		// Оставить комменты /*! ... */. Не строгое сжатие.
	// 		}
	// 	}
	// }))
	.pipe(cleanCSS({		// сжимаем
		level: {
			2: {
			  all: false, // установит все значения в `false`. Мощное сжатие.
			  removeDuplicateRules: true // удалить повторяющиеся правила
			}
		  }
	})) // Opt., comment /*! ... */ out when debugging
	.pipe(sourcemaps.write('/'))		// записываем карту кода как отдельный файл (путь из константы)
	.pipe(gulp.dest(dirs.build + '/css'))		// записываем CSS-файл (путь из константы)
	.pipe(browserSync.stream());		// обновляем CSS на странице при изменении
};

// ФУНКЦИЯ: Компиляция препроцессора SASS or SCSS и стилей CUSTOM
function styles_custom() {
	return gulp.src(dirs.source + '/' + syntax + '/**/*.' + syntax)		// какой файл компилировать (путь из константы)
	// .pipe(include())		// подключим include-ы
	.pipe(plumber({ errorHandler: onError }))		// продолжаем работу при ошибках
	.pipe(sass({ outputStyle: 'expanded' }).on('error', notify.onError()))		// компилируем (or 'compressed')
	.pipe(postcss([ autoprefixer({		// делаем постпроцессинг
		browsers: ['> 0.1%', 'last 15 versions'],
		cascade: true,
		grid: 'autoplace'		// для IE
		}),		// автопрефиксирование
		mqpacker({ sort: sortCSSmq.desktopFirst }),		// объединение медиавыражений (sortCSSmq or sortCSSmq.desktopFirst)
	]))
	// .pipe(cleanCSS({		// сжимаем
	// 	level: {
	// 		2: {
	// 		  //all: false, // установит все значения в `false`. Мощное сжатие.
	// 		  removeDuplicateRules: true // turns on removing duplicate rules
	// 		}
	// 	  }
	// })) // Opt., comment /*! ... */ out when debugging
	.pipe(gulp.dest(dirs.build + '/css'))		// записываем CSS-файл (путь из константы)
	.pipe(browserSync.stream());		// обновляем CSS на странице при изменении
};

// ФУНКЦИЯ: Конкатенация и углификация Javascript на продакшен MAIN
function scripts_build() {
	return gulp.src([		// список файлов в нужной последовательности (',' после каждого файла, в конце ',' не нужна)
		//dirs.source + '/libs/jquery/dist/jquery.min.js',
		dirs.source + '/js/**/main.js'		 // всегда в конце (Always at the end)
	])
	.pipe(include())		// подключим include-ы
	.pipe(plumber({ errorHandler: onError }))		// продолжаем работу при ошибках
	//.pipe(concat('scripts.min.js')) // ???
	.pipe(sourcemaps.init())		// инициируем карту кода
	.pipe(concat('main.js'))		// конкатенация JS
	.pipe(gulp.dest(dirs.build + '/js'))		// записываем JS-файл (путь из константы)
	.pipe(rename('main.min.js'))		// переименовываем
	.pipe(uglify({
		toplevel: true, // включить изменение имени переменной и функции верхнего уровня и удалить неиспользуемые переменные и функции
		ie8: true		// to support ie8
	}))		// углификация JS
	.pipe(sourcemaps.write('/'))		// записываем карту кода как отдельный файл (путь из константы)
	.pipe(gulp.dest(dirs.build + '/js'))		// записываем JS-файл (путь из константы)
	.pipe(browserSync.stream());		// обновляем JS на странице при изменении
};

// ФУНКЦИЯ: Javascript CUSTOM
function scripts_custom() {
	return gulp.src([		// список файлов в нужной последовательности (',' после каждого файла, в конце ',' не нужна)
		//dirs.source + '/libs/jquery/dist/jquery.min.js',
		dirs.source + '/js/**/*.js'		 // всегда в конце (Always at the end)
	])
	.pipe(include())		// подключим include-ы
	.pipe(plumber({ errorHandler: onError }))		// продолжаем работу при ошибках
	.pipe(gulp.dest(dirs.build + '/js'))		// записываем JS-файл (путь из константы)
	.pipe(browserSync.stream());		// обновляем JS на странице при изменении
};

// ФУНКЦИЯ: Сборка HTML
function html() {
	return gulp.src([dirs.source + '/**/*.html',	// какие файлы обрабатывать (путь из константы, маска имени)/*.html
		'!' + dirs.source + '/libs/*',				// кроме
	])
	.pipe(include())		// подключим include-ы
	.pipe(htmlbeautify())		// красивый HTML
	.pipe(plumber({ errorHandler: onError }))		// продолжаем работу при ошибках
	.pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))		// убираем комментарии <!--DEV ... -->
	.pipe(gulp.dest(dirs.build))		// записываем файлы (путь из константы). Склеенный.
};

// ФУНКЦИЯ: Удаление каталога /build/templates
function del_tmpl() {
	return del(dirs.build + '/templates');
};

// ФУНКЦИЯ: Сборка PHP
function php() {
	return gulp.src([dirs.source + '/**/*.php',			// какие файлы обрабатывать (путь из константы, маска имени)
		'!' + dirs.source + '/libs/*',					// кроме
	])
	.pipe(plumber({ errorHandler: onError }))		// продолжаем работу при ошибках
	.pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))		// убираем комментарии <!--DEV ... -->
	.pipe(gulp.dest(dirs.build));		// записываем файлы (путь из константы)
};

// ФУНКЦИЯ: Копирование изображений
function img() {
	return gulp.src([
		dirs.source + '/img/**/*.{ico,gif,png,jpg,jpeg,svg}',      // какие файлы обрабатывать (путь из константы, маска имени, много расширений)
		'!' + dirs.source + '/img/png-sprite/*',
		'!' + dirs.source + '/img/svg-sprite/*',
	],
	{since: gulp.lastRun('img')}                            // оставим в потоке обработки только изменившиеся от последнего запуска задачи (в этой сессии) файлы
	)
	.pipe(plumber({ errorHandler: onError }))               // Продолжаем работу при ошибках
	.pipe(newer(dirs.build + '/img'))                       // оставить в потоке только новые файлы (сравниваем с содержимым папки билда)
	.pipe(gulp.dest(dirs.build + '/img'));                  // записываем файлы (путь из константы)
};

// ФУНКЦИЯ: Оптимизация изображений (ЗАДАЧА ЗАПУСКАЕТСЯ ТОЛЬКО ВРУЧНУЮ)
function img_opt() {
	return gulp.src([
		dirs.source + '/img/**/*.{gif,png,jpg,jpeg,svg}',        // какие файлы обрабатывать (путь из константы, маска имени, много расширений)
		'!' + dirs.source + '/img/sprite-svg.svg',               // SVG-спрайт брать в обработку не будем
		'!' + dirs.source + '/img/png-sprite/*',
		'!' + dirs.source + '/img/svg-sprite/*',
	])
	.pipe(plumber({ errorHandler: onError }))                    // продолжаем работу при ошибках
	.pipe(cache(imagemin({                                       // сжимаем с наилучшими настройками
		interlaced: true,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	})))
	.pipe(gulp.dest(dirs.source + '/img'));                       // записываем файлы в исходную директорию
};

// ФУНКЦИЯ: Сборка SVG-спрайта
function svgStore(callback) {
	var spritePath = dirs.source + '/img/svg-sprite';          // переменная - путь к исходникам SVG-спрайта
	if(fileExist(spritePath) !== false) {
		return gulp.src(spritePath + '/*.svg')                 // берем только SVG файлы из этого каталога, подкаталога игнорируем
		.pipe(plumber({ errorHandler: onError }))              // продолжаем работу при ошибках
		.pipe(svgmin(function (file) {
			return {
				plugins: [{
					cleanupIDs: {
						minify: true
					}
				}, {
					removeViewBox: false
				}]
			}
		}))
		.pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('svg').attr('style',  'display:none');
			},
			parserOptions: {xmlMode: true}
		}))
		.pipe(svgstore({ inlineSvg: true }))
		.pipe(rename('sprite-svg.svg'))
		.pipe(gulp.dest(dirs.source + '/img'));
	} else {
		console.log('Нет файлов для сборки SVG-спрайта');
		callback();
	}
};

// ФУНКЦИЯ: Сшивка PNG-спрайта
function png_sprite() {
	let fileName = 'sprite-png' + '.png';		// формируем случайное и уникальное имя файла
	let spriteData = gulp.src(dirs.source + '/img/png-sprite/*.png')		// получаем список файлов для создания спрайта
	.pipe(plumber({ errorHandler: onError }))		// продолжаем работу при ошибках
	.pipe(spritesmith({		// шьем спрайт
		imgName: fileName,		// имя файла (сформировано чуть выше)
		cssName: '_sprite-png.' + syntax + '',		// имя генерируемого стилевого файла (там примеси для комфортного использования частей спрайта) or scss
		padding: 4,		// отступ между составными частями спрайта
		imgPath: '../img/' + fileName		// путь к файлу картинки спрайта (используеися в генерируемом стилевом файле спрайта)
	}));
	let imgStream = spriteData.img		// оптимизируем и записываем картинку спрайта
	.pipe(buffer())
	.pipe(imagemin())
	.pipe(gulp.dest(dirs.source + '/img'));
	let cssStream = spriteData.css		// записываем генерируемый стилевой файл спрайта
	.pipe(gulp.dest(dirs.source + '/' + syntax + '/blocks'));
	return merge(imgStream, cssStream);
};

// ФУНКЦИЯ: Перемещение шрифтов
function fonts() {
	return gulp.src(dirs.source + '/fonts/**/*.{eot,ttf,woff,woff2}')
	.pipe(gulp.dest('build' + '/fonts'));
};

// ФУНКЦИЯ: Сборка CSS-библиотек
function libs_css() {
  return gulp.src(dirs.source + '/libs/**/*')
    .pipe(gulp.dest(dirs.build + '/libs'));
};

// ФУНКЦИЯ: Очистка кэша
function clear_cache() {
	return cache.clearAll();		// очистка кэша
};

// ФУНКЦИЯ: Очистка папки сборки
// Также нужно явно игнорировать родительские каталоги
// del.sync(['public/assets/**', '!public/assets', '!public/assets/goat.png']);
function clean_build() {
	return del([                                              // стираем
		dirs.build + '/**/*',                                   // все файлы из директории сборки (путь из константы)
		'!' + dirs.build + '',
		'!' + dirs.build + '/readme.md'                         // кроме readme.md (путь из константы)
	]);
};

// ФУНКЦИЯ: Локальный сервер, слежение
function watch(){
	browserSync.init({		// запускаем локальный сервер (показ, автообновление, синхронизацию)
		server: {
			baseDir: dirs.source // каталог проэкта (путь из константы) dirs.build or dirs.source
		},
		//proxy: "local.domain", // PHP local.domain
		port: 3000,		// порт, на котором будет работать сервер (default 3000)
		//startPath: 'index.html',		// файл, который буде открываться в браузере при старте сервера
		//startPath: '/build/index.html',		// файл, который буде открываться в браузере при старте сервера
		//tunnel: true,
		//tunnel: "lasch", // Demonstration page: http://projectname.localtunnel.me
		//online: true, // в онлайне или оффлайне
		//open: "tunnel", // локальный сервер в режиме tunnel, true or false
		notify: false
	});
	// следим за SASS. При изменении запускаем компиляцию (обновление браузера — в задаче компиляции)
	gulp.watch(dirs.source + '/' + syntax + '/**/*.' + syntax, gulp.series('styles_custom'));
	// следим за JS. При изменении пересобираем и обновляем в браузере
	gulp.watch(dirs.source + '/js/**/*.js', gulp.series('scripts_custom', reload));
	// следим за HTML в каталоге с исходниками. При изменении пересобираем и обновляем в браузере
	gulp.watch(dirs.source + '/**/*.html', gulp.series('html', reload));
	// следим за PHP в каталоге с исходниками. При изменении пересобираем и обновляем в браузере
	gulp.watch(dirs.source + '/**/*.php', gulp.series('php', reload));
	// следим за SVG
	gulp.watch(dirs.source + '/img/svg-sprite/*.svg', gulp.series('svgStore', 'html', reload));
	gulp.watch(dirs.source + '/img/png-sprite/*.png', gulp.series('png_sprite', 'styles_custom'));
	// следим за изображениями. При изменении оптимизируем, копируем и обновляем в браузере
	gulp.watch(dirs.source + '/img/**/*.{ico,gif,png,jpg,jpeg,svg}', gulp.series('img', reload));
};

// ФУНКЦИЯ: Удаленная синхронизация (отправка файлов по FTP/SFTP)
function rsynch() {
	return gulp.src(dirs.build + '/**/*')
	.pipe(rsync({
		root: dirs.build, // Корневая папка
		hostname: 'username@yousite.com', // Имя хоста
		destination: 'yousite/public_html/', // Каталог назначения
		// include: ['*.htaccess'], // Includes files to deploy Вкл.
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy Искл.
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}));
};

// ФУНЦИЯ: ВЫПОЛНЯЕТСЯ ТОЛЬКО ВРУЧНУЮ. Отправка в GH pages (ветку gh-pages репозитория)
function deploy_GH() {
	return gulp.src(dirs.build + '/**/*')
	.pipe(ghPages());
};

// Функция для перезагрузки в браузере после выполнения задачи
function reload(done) {
  browserSync.reload();
  done();
}

// Проверка существования файла/папки
function fileExist(path) {
	const fs = require('fs');
	try {
		fs.statSync(path);
	} catch(err) {
		return !(err && err.code === 'ENOENT');
	}
};

var onError = function(err) {
	notify.onError({
		title: 'Error in ' + err.plugin,
	})(err);
	this.emit('end');
};

//********************************************************************************************************************//
// ЗАДАЧИ
gulp.task('styles_custom', styles_custom);	// ЗАДАЧА: Компиляция препроцессора SASS or SCSS и стилей CUSTOM
gulp.task('styles_build', styles_build);	// ЗАДАЧА: Компиляция препроцессора SASS or SCSS и стилей на продакшен MAIN
gulp.task('scripts_custom', scripts_custom);// ЗАДАЧА: Javascript CUSTOM
gulp.task('scripts_build', scripts_build);	// ЗАДАЧА: Конкатенация и углификация Javascript на продакшен MAIN
gulp.task('del_tmpl', del_tmpl);			// ЗАДАЧА: Удаление каталога /build/templates
gulp.task('html', gulp.series(html, 'del_tmpl'));	// ЗАДАЧА: Сборка HTML + del_tmpl
gulp.task('php', php);						// ЗАДАЧА: Сборка PHP
gulp.task('img', img);						// ЗАДАЧА: Копирование изображений
gulp.task('img_opt', img_opt);				// ЗАДАЧА: Оптимизация изображений (ЗАДАЧА ЗАПУСКАЕТСЯ ТОЛЬКО ВРУЧНУЮ)
gulp.task('svgStore', svgStore);			// ЗАДАЧА: Сборка SVG-спрайта
gulp.task('png_sprite', png_sprite);		// ЗАДАЧА: Сшивка PNG-спрайта
gulp.task('fonts', fonts);					// ЗАДАЧА: Перемещение шрифтов
gulp.task('libs_css', libs_css);			// ЗАДАЧА: Сборка CSS-библиотек
gulp.task('clear_cache', clear_cache);		// ЗАДАЧА: Очистка кэша
gulp.task('clean_build', clean_build);		// ЗАДАЧА: Очистка папки сборки
gulp.task('watch', watch);					// ЗАДАЧА: Локальный сервер, слежение
gulp.task('deploy_GH', deploy_GH);			// ЗАДАЧА: ВЫПОЛНЯЕТСЯ ТОЛЬКО ВРУЧНУЮ. Отправка в GH pages

// ЗАДАЧА: Сборка на продакшен + Очистка кэша
gulp.task('Build+CC', gulp.series('clean_build', 'svgStore', 'png_sprite',		// последовательно: очистку папки сборки
					gulp.parallel('styles_build', 'scripts_build', 'img', 'fonts'),
					'html', 'php', 'libs_css', gulp.parallel('styles_custom', 'scripts_custom'), 'clear_cache'		// последовательно: сборку разметки
));

// ЗАДАЧА: РАЗРАБОТКА. Локальный сервер, слежение + Сборка на продакшен
gulp.task('DEV', gulp.series('Build+CC', 'watch'));

// ЗАДАЧА: Задача по умолчанию
gulp.task('Default',
	gulp.series('watch')
);
