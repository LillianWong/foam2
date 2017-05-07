/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.client',
  name: 'Client',

  documentation: 'Client for connecting to NANOS server.',

  requires: [
    'foam.dao.EasyDAO',
    'foam.nanos.boot.NSpec',
    'foam.nanos.menu.Menu',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Language',
    'foam.nanos.auth.Permission',
    'foam.nanos.script.Script',
    'foam.nanos.test.Test'
  ],

  exports: [
    'menuDAO',
    'nSpecDAO',
    'userDAO',
    'groupDAO',
    'languageDAO',
    'permissionDAO',
    'scriptDAO',
    'testDAO'
  ],

  properties: [
    {
      name: 'nSpecDAO',
      factory: function() {
        return this.createDAO({
          of: this.User,
          seqNo: true,
          testData: [
            { id: 1, firstName: 'Simon', lastName: 'Alexander', phone: '16133195312' }
          ]
        });
      }
    },

    {
      name: 'menuDAO',
      factory: function() {
        return this.createDAO({
          of: this.Menu,
          testData: [
            // { id: 'dash',     label: 'Dashboard' },
            // { id: 'sales',    label: 'Sales' },
            // { id: 'expenses', label: 'Expenses' },
            // { id: 'settings', label: 'Settings' },
            { id: 'admin',    label: 'Admin' },
              { parent: 'admin', id: 'nspec', label: 'Nano Services' },
              { parent: 'admin', id: 'auth', label: 'Authentication' },
                { parent: 'auth', id: 'users',       label: 'Users' },
                { parent: 'auth', id: 'groups',      label: 'Groups' },
                { parent: 'auth', id: 'permissions', label: 'Permissions' },
                { parent: 'auth', id: 'lang',        label: 'Languages' },
            //  { parent: 'admin', id: 'countries', label: 'Countries' },
              { parent: 'admin', id: 'menus',     label: 'Menus' },
            { id: 'debug',    label: 'Debug' },
              { parent: 'debug', id: 'api',     label: 'API Reference' },
              { parent: 'debug', id: 'context', label: 'Context Walker' },
              { parent: 'debug', id: 'data',    label: 'View Data' }
          ]
        });
      }
    },

    {
      name: 'userDAO',
      factory: function() {
        return this.createDAO({
          of: this.User,
          seqNo: true,
          testData: [
            { id: 1, firstName: 'Simon', lastName: 'Alexander', phone: '16133195312' }
          ]
        });
      }
    },

    {
      name: 'languageDAO',
      factory: function() {
        return this.createDAO({
          of: this.Language,
          testData: [
            { code: 'en', label: 'English' }
          ]
        });
      }
    },

    {
      name: 'groupDAO',
      factory: function() {
        return this.createDAO({
          of: this.Group,
          seqNo: true,
          testData: [
            { id: 1, firstName: 'nanoPay Admin', lastName: 'nanoPay administration users' },
            { id: 2, firstName: 'Admin',         lastName: 'Administration users' },
            { id: 3, firstName: 'Tester',        lastName: 'Testers' },
            { id: 3, firstName: 'End User',      lastName: 'End users' }
          ]
        });
      }
    },

      {
        name: 'permissionDAO',
        factory: function() {
          return this.createDAO({
            of: this.Permission,
            testData: [
              { id: '*',         description: 'Do anything global permission.' },
              { id: 'menu.auth', description: 'Perform authentication related configuration.' }
            ]
          });
        }
      },

        {
          name: 'scriptDAO',
          factory: function() {
            return this.createDAO({
              of: this.Script,
              seqNo: true,
              testData: [
              ]
            });
          }
        },

        {
          name: 'testDAO',
          factory: function() {
            return this.createDAO({
              of: this.Test,
              seqNo: true,
              testData: [
              ]
            });
          }
        }

  ],

  methods: [
    function createDAO(config) {
      config.daoType = 'IDB';
      config.cache   = true;

      return this.EasyDAO.create(config);
    }
  ]
});