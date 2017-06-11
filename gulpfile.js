const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require("gulp-rename");
const prefix = require('gulp-autoprefixer');
const sassVariables = require('gulp-sass-variables');
const browserSync = require('browser-sync');
const cp = require('child_process');

process.env.NODE_ENV = 'dev';

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', (done) => {
    return cp.spawn('jekyll', ['build'], { stdio: 'inherit' })
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], () => {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], () => {
    browserSync({
        server: {
            baseDir: '_site'
        },
        notify: false
    });
});

/**
 * Copy font files to the
 */
gulp.task('fonts', () => {
    return gulp.src([
        'assets/fonts/**/*.eot',
        'assets/fonts/**/*.svg',
        'assets/fonts/**/*.ttf',
        'assets/fonts/**/*.woff',
    ])
        .pipe(gulp.dest('_site/assets/fonts'))
        .pipe(browserSync.reload({ stream: true }));
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', () => {
    return gulp.src('assets/scss/*.scss')
        .pipe(sassVariables({
            $env: process.env.NODE_ENV,
        }))
        .pipe(sass({
            outputStyle: 'compressed',
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(browserSync.reload({ stream: true }))
        .pipe(gulp.dest('assets/css'));
});

/**
 * Watch scss files for changes & recompile
 * Watch font files
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', () => {
    gulp.watch('assets/scss/**', ['sass']);
    gulp.watch('assets/fonts/**/*', ['fonts']);
    gulp.watch('assets/js/**', ['jekyll-rebuild']);
    gulp.watch(['index.html', '_layouts/*.html', '_includes/**/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch', 'sass', 'fonts']);
