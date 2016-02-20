
module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json') || {};

  // Project configuration.
  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json') || {},

    // license header adding
    usebanner: {
      dist: {
        options: {
          position: 'top',
          replace: true,
          linebreak: true,
          process: function( filepath ) {
            var filename = filepath.match(/\/([^/]*)$/)[1];
            var modulename = filename.substring(0,1).toUpperCase()+filename.substring(1).replace(".js","");

            return grunt.template.process('/* <%= filename %> \n'+
              ' * \n'+
              ' * copyright (c) 2010-<%= grunt.template.today("yyyy") %> by <%= author %>\n'+
              ' * \n'+
              ' * This program is free software; you can redistribute it and/or modify it\n'+
              ' * under the terms of the GNU General Public License as published by the Free\n'+
              ' * Software Foundation; either version 3 of the License, or (at your option)\n'+
              ' * any later version.\n'+
              ' *\n'+
              ' * This program is distributed in the hope that it will be useful, but WITHOUT\n'+
              ' * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or\n'+
              ' * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for\n'+
              ' * more details.\n'+
              ' *\n'+
              ' * You should have received a copy of the GNU General Public License along\n'+
              ' * with this program; if not, write to the Free Software Foundation, Inc.,\n'+
              ' * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA\n'+
              ' *\n'+
              ' * @module <%= modulename %> \n'+
              ' * @title  <%= title %> \n'+
              ' * @version <%= version %>\n'+
              ' */\n', {
                  data: {
                    filename: filename,
                    modulename: modulename,
                    title: "CometVisu " + modulename,
                    author: pkg.authors[0].name+ " ["+pkg.authors[0].email+"]",
                    version: pkg.version
                  }
              }
            );
          }
        },
        files: {
          src: [ 'src/lib/*.js', 'src/structure/pure/*.js' ]
        }
      }
    },

    // appcache
    manifest: {
      generate: {
        options: {
          basePath: 'release/',
          preferOnline: false,
          headcomment: " <%= pkg.name %> v<%= pkg.version %>",
          verbose: true,
          timestamp: true,
          hash: true,
          network: [
            'index_external_editor_test.html',
            'check_config.php',
            'designs/get_designs.php',
            'config/structure_custom.js',
            'editor/index.php',
            'editor/bin/',
            'editor/dataproviders/',
            'upgrade/',
            'lib/library_version.inc.php',
            '*',
            'http://*',
            'https://*'
          ],
          master: ['index.html']
        },
        src: [
          'index.html',
          'visu_config.xsd',
          'dependencies/require-2.1.15.min.js',
          'dependencies/css.js',
          'icon/comet_64_ff8000.png',
          'icon/comet_webapp_icon_114.png',
          'icon/comet_webapp_icon_144.png',
          'icon/comet_webapp_icon_android_36.png',
          'icon/comet_webapp_icon_android_48.png',
          'icon/comet_webapp_icon_android_72.png',
          'icon/comet_webapp_icon_android_96.png',
          'icon/comet_webapp_icon_android_144.png',
          'icon/comet_webapp_icon_android_192.png',
          'icon/iconconfig.js',
          'lib/templateengine.js',
          'designs/**/*.*',
          'plugins/**/*.{js,css,png,jpf,ttf,svg,map}'
        ],
        dest: 'release/cometvisu.appcache'
      }
    },

    // the build script
    requirejs: {
      compile: {
        options: {
          baseUrl: './',
          appDir: 'src/',  // relative to baseUrl
          dir: 'release/',
          mainConfigFile: 'src/lib/templateengine.js',
          optimize: 'uglify2',
          generateSourceMaps: true,
          preserveLicenseComments: false,

          // config options to handle required CSS files:
          separateCSS: true,
          buildCSS: false,
          paths: {
            'css-builder': '../build/css-builder',
            'normalize': '../build/normalize'
          },

          modules: [
            // the main application
            { name: 'lib/templateengine', include: ['css'] },
            // optimize the plugins
            { name: 'plugins/calendarlist/structure_plugin',   exclude: ['structure_custom', 'css', 'normalize']  },
            { name: 'plugins/clock/structure_plugin',          exclude: ['structure_custom', 'css', 'normalize']  },
            { name: 'plugins/colorchooser/structure_plugin',   exclude: ['structure_custom', 'css', 'normalize']  },
            { name: 'plugins/diagram/structure_plugin',        exclude: ['structure_custom', 'css', 'normalize']  },
            { name: 'plugins/gauge/structure_plugin',          exclude: ['structure_custom', 'css', 'normalize']  },
            { name: 'plugins/rss/structure_plugin',            exclude: ['structure_custom', 'css', 'normalize']  },
            { name: 'plugins/rsslog/structure_plugin',         exclude: ['structure_custom', 'css', 'normalize']  },
            { name: 'plugins/strftime/structure_plugin',       exclude: ['structure_custom', 'css', 'normalize']  },
            { name: 'plugins/svg/structure_plugin',            exclude: ['structure_custom', 'css', 'normalize']  },
            { name: 'plugins/timeout/structure_plugin',        exclude: ['structure_custom', 'css', 'normalize']  },
            { name: 'plugins/upnpcontroller/structure_plugin', exclude: ['structure_custom', 'css', 'normalize']  }
          ],
          done: function(done, output) {
            var duplicates = require('rjs-build-analysis').duplicates(output);

            if (duplicates.length > 0) {
              grunt.log.subhead('Duplicates found in requirejs build:');
              grunt.log.warn(duplicates);
              return done(new Error('r.js built duplicate modules, please check the excludes option.'));
            }

            done();
          }
        }
      }
    },

    // javascript syntax checker
    jshint: {
      options: {
       // reporter: require('jshint-stylish'),
        ignores: [ "**/dependencies/**", "**/dep/**"]
      },
      all: [ 'src/**/*.js' ]
    },

    // check coding-style: https://github.com/CometVisu/CometVisu/wiki/Coding-style
    jscs: {
      main: {
        options: {
          excludeFiles: [ "**/dependencies/**", "**/dep/**"],
          //preset: "jquery",
          validateIndentation: 2,
          validateLineBreaks: "LF",
          fix: false
          //maximumLineLength : {
          //  value: 120,
          //  allExcept: [
          //    "comments",
          //    "functionSignature"
          //  ]
          //}
        },
        files: {
          src: [ "src/**/*.js"]
        }
      }
    },

    // make a zipfile
    compress: {
      tar: {
        options: {
          mode: 'tgz',
          level: 9,
          archive: function() {
            return "Cometvisu-"+pkg.version+".tar.gz"
          }
        },
        files: [
          { expand: true, cwd: 'release', src: ['./**'], dest: 'cometvisu/' } // includes files in path
        ]
      },
      zip: {
        options: {
          mode: 'zip',
          level: 9,
          archive: function() {
            return "Cometvisu-"+pkg.version+".zip"
          }
        },
        files: [
          { expand: true, cwd: 'release', src: ['./**'], dest: 'cometvisu/' } // includes files in path
        ]
      }
    },

    'github-release': {
      options: {
        repository: 'peuter/cometvisu',
        release: {
          tag_name: pkg.version,
          name: pkg.version,
          body: pkg.description
        }
      },
      files: {
        src: [ "Cometvisu-"+pkg.version+".zip", "Cometvisu-"+pkg.version+".tar.gz" ]
      }
    },
    prompt: {
      target: {
        options: {
          questions: [
            {
              config: 'github-release.options.auth.user', // set the user to whatever is typed for this question
              type: 'input',
              message: 'GitHub username:'
            },
            {
              config: 'github-release.options.auth.password', // set the password to whatever is typed for this question
              type: 'password',
              message: 'GitHub password:'
            }
          ]
        }
      }
    },

    clean: {
      archives : ['*.zip', '*.gz'],
      release: ['release/']
    }
  });

  // Load the plugin tasks
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks("grunt-jscs");
  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-manifest');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-github-releaser');
  grunt.loadNpmTasks('grunt-prompt');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task runs all code checks, updates the banner and builds the release
  //grunt.registerTask('default', [ 'jshint', 'jscs', 'usebanner', 'requirejs', 'manifest', 'compress:tar', 'compress:zip' ]);
  grunt.registerTask('build', [ 'jscs', 'usebanner', 'requirejs', 'manifest', 'compress:tar', 'compress:zip' ]);
  grunt.registerTask('lint', [ 'jshint', 'jscs' ]);

  grunt.registerTask('release', [ 'clean', 'prompt', 'default', 'github-release' ]);

  grunt.registerTask('default', 'build');
};