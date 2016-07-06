module.exports = function(grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt);
  
  grunt.initConfig({
    serverConfig: grunt.file.readJSON('config.json'),

    wiredep: {
      task: {
        src: ['src/client/index.html'],
        // aboslute paths instead of relative paths http://stackoverflow.com/a/26024882/679716
        ignorePath: /^(\/|\.+(?!\/[^\.]))+\.+/ 
      }
    },
    
    angularFileLoader: {
      options: {
        scripts: ['src/client/app/**/*.js'],
        relative: false
      },
      your_target: {
        src: ['src/client/index.html']
      }
    },
    
    nodemon: {
      dev: {
        script: 'src/server/app.js'
      }
    },

    sass: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          'src/client/styles/main.css': 'src/client/scss/main.scss'
        }
      }
    },

    shell: {
      nodeServer: {
        options: {
          stdout: true
        },
        command: 'forever -al <%= serverConfig.logfile %> -c nodemon <%= serverConfig.server %> -p <%= serverConfig.port %>'
      }
    },

    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      sass: {
        files: ['src/client/scss/**/*.scss'],
        tasks: ['sass']
      },
      angularFileLoader: {
        files: ['src/client/app/app.module.js'],
        tasks: ['angularFileLoader']
      }
    },

    concurrent: {
      options: {
        logConcurrentOutput: true,
      },
      default: [
        'shell:nodeServer',
        'watch'
      ]
    }

  });

  // concurrent tasks most go last   
  grunt.registerTask('default', [
    'wiredep',
    'angularFileLoader',
    'sass',
    'concurrent:default'
  ]);
};
