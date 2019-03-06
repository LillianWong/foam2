/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'UserAndGroupAuthService',
  flags: ['java'],

  implements: [
    'foam.nanos.NanoService',
    'foam.nanos.auth.AuthService'
  ],

  imports: [
    'localUserDAO',
    'localGroupDAO',
    'localSessionDAO'
  ],

  javaImports: [
    'foam.core.ContextAwareSupport',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.logger.Logger',
    'foam.nanos.NanoService',
    'foam.nanos.session.Session',
    'foam.util.Email',
    'foam.util.Password',
    'foam.util.SafetyUtil',

    'javax.security.auth.AuthPermission',
    'java.security.Permission',
    'java.util.Calendar',
    'java.util.List',
    'java.util.regex.Pattern',

    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public final static String CHECK_USER_PERMISSION = "service.auth.checkUser";
        `);
      }
    }
  ],

  constants: [
    {
      name: 'PASSWORD_VALIDATE_REGEX',
      type: 'String',
      value: '^.{6,}$'
    },
    {
      name: 'PASSWORD_VALIDATION_ERROR_MESSAGE',
      type: 'String',
      value: 'Password must be at least 6 characters long.'
    }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'userDAO',
      javaFactory: 'return (DAO) getLocalUserDAO();'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'groupDAO',
      javaFactory: 'return (DAO) getLocalGroupDAO();'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'sessionDAO',
      javaFactory: 'return (DAO) getLocalSessionDAO();'
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
        getUserDAO();
        getGroupDAO();
        getSessionDAO();
      `
    },
    {
      name: 'getCurrentUser',
      type: 'foam.nanos.auth.User',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      javaCode: `
        // fetch context and check if not null or user id is 0
        Session session = x.get(Session.class);
        if ( session == null || session.getUserId() == 0 ) {
          throw new AuthenticationException("Not logged in");
        }

        // get user from session id
        User user = (User) userDAO_.find(session.getUserId());
        if ( user == null ) {
          throw new AuthenticationException("User not found: " + session.getUserId());
        }

        // check if user enabled
        if ( ! user.getEnabled() ) {
          throw new AuthenticationException("User disabled");
        }

        // check if user login enabled
        if ( ! user.getLoginEnabled() ) {
          throw new AuthenticationException("Login disabled");
        }

        // check if user group enabled
        Group group = (Group) groupDAO_.find(user.getGroup());
        if ( group != null && ! group.getEnabled() ) {
          throw new AuthenticationException("User group disabled");
        }

        // check for two-factor authentication
        if ( user.getTwoFactorEnabled() && ! session.getContext().getBoolean("twoFactorSuccess") ) {
          throw new AuthenticationException("User requires two-factor authentication");
        }

        return user;
      `
    },
    {
      name: 'generateChallenge',
      documentation: `A challenge is generated from the userID provided. This is
        saved in a LinkedHashMap with TTL of 5.`,
      type: 'String',
      args: [
        {
          class: 'Long',
          name: 'userID'
        }
      ],
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      javaCode: `
        throw new UnsupportedOperationException("Unsupported operation: generateChallenge");
      `
    },
    {
      name: 'challengedLogin',
      documentation: `Checks the LinkedHashMap to see if the the challenge
        supplied is correct and the TTL is still valid.

        How often should we purge this map for challenges that have expired?`,
      type: 'foam.nanos.auth.User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'userID',
          type: 'Long'
        },
        {
          name: 'challenge',
          type: 'String'
        }
      ],
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      javaCode: `
        throw new UnsupportedOperationException("Unsupported operation: challengedLogin");
      `
    },
    {
      name: 'userAndGroupContext',
      documentation: `Logs user and sets user group into the current sessions
        context.`,
      type: 'foam.nanos.auth.User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          of: 'foam.nanos.auth.User'
        },
        {
          name: 'password',
          type: 'String'
        }
      ],
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      javaCode: `
        if ( user == null ) {
          throw new AuthenticationException("User not found");
        }

        // check if user enabled
        if ( ! user.getEnabled() ) {
          throw new AuthenticationException("User disabled");
        }

        // check if user login enabled
        if ( ! user.getLoginEnabled() ) {
          throw new AuthenticationException("Login disabled");
        }

        // check if user group enabled
        Group group = (Group) groupDAO_.find(user.getGroup());
        if ( group != null && ! group.getEnabled() ) {
          throw new AuthenticationException("User group disabled");
        }

        if ( ! Password.verify(password, user.getPassword()) ) {
          throw new AuthenticationException("Invalid Password");
        }

        // Freeze user
        user = (User) user.fclone();
        user.freeze();

        Session session = x.get(Session.class);
        session.setUserId(user.getId());
        session.setContext(session.getContext().put("user", user));

        return user;
      `
    },
    {
      name: 'login',
      documentation: `Login a user by the id provided, validate the password and
        return the user in the context`,
      type: 'foam.nanos.auth.User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'userID',
          type: 'Long'
        },
        {
          name: 'password',
          type: 'String'
        }
      ],
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      javaCode: `
        if ( userID < 1 || SafetyUtil.isEmpty(password) ) {
          throw new AuthenticationException("Invalid Parameters");
        }

        return userAndGroupContext(x, (User) userDAO_.find(userID), password);
      `
    },
    {
      name: 'loginByEmail',
      type: 'foam.nanos.auth.User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'email',
          type: 'String'
        },
        {
          name: 'password',
          type: 'String'
        }
      ],
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      javaCode: `
        User user = (User) userDAO_.find(
          AND(
            EQ(User.EMAIL, email.toLowerCase()),
            EQ(User.LOGIN_ENABLED, true)
          )
        );

        if ( user == null ) {
          throw new AuthenticationException("User not found");
        }
        return userAndGroupContext(x, user, password);
      `
    },
    {
      name: 'checkUserPermission',
      documentation: `Checks if the user passed into the method has the passed
        in permission attributed to it by checking their group. No check on User
        and group enabled flags.`,
      type: 'boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          of: 'foam.nanos.auth.User'
        },
        {
          name: 'permission',
          of: 'java.security.Permission'
        }
      ],
      javaCode: `
        // check whether user has permission to check user permissions
        if ( ! check(x, CHECK_USER_PERMISSION) ) {
          throw new AuthorizationException();
        }

        if ( user == null || permission == null ) {
          return false;
        }

        try {
          String groupId = (String) user.getGroup();

          while ( ! SafetyUtil.isEmpty(groupId) ) {
            Group group = (Group) groupDAO_.find(groupId);

            // if group is null break
            if ( group == null ) {
              break;
            }

            // check permission
            if ( group.implies(permission) ) {
              return true;
            }

            // check parent group
            groupId = group.getParent();
          }
        } catch (Throwable t) {
        }

        return false;
      `
    },
    {
      name: 'checkPermission',
      documentation: `Check if the user in the context supplied has the right
        permission.`,
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'permission',
          of: 'java.security.Permission'
        }
      ],
      javaCode: `
        if ( x == null || permission == null ) {
          return false;
        }

        Session session = x.get(Session.class);
        if ( session == null || session.getUserId() == 0 ) {
          return false;
        }

        // NOTE: It's important that we use the User from the context here instead
        // of looking it up in a DAO because if the user is actually an entity that
        // an agent is acting as, then the user we get from the DAO won't have the
        // correct group, which is the group set on the junction between the agent
        // and the entity.
        User user = (User) x.get("user");

        // check if user exists and is enabled
        if ( user == null || ! user.getEnabled() ) {
          return false;
        }

        try {
          String groupId = (String) user.getGroup();

          while ( ! SafetyUtil.isEmpty(groupId) ) {
            Group group = (Group) groupDAO_.find(groupId);

            // if group is null break
            if ( group == null ) {
              break;
            }

            // check if group is enabled
            if ( ! group.getEnabled() ) {
              return false;
            }

            // check permission
            if ( group.implies(permission) ) {
              return true;
            }

            // check parent group
            groupId = group.getParent();
          }
        } catch (IllegalArgumentException e) {
          Logger logger = (Logger) x.get("logger");
          logger.error("check", permission, e);
        } catch (Throwable t) {
          throw new RuntimeException(t);
        }

        return false;
      `
    },
    {
      name: 'check',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'permission',
          type: 'String'
        }
      ],
      javaCode: `
        return checkPermission(x, new AuthPermission(permission));
      `
    },
    {
      name: 'validatePassword',
      args: [
        {
          name: 'newPassword',
          type: 'String'
        }
      ],
      javaCode: `
        if ( SafetyUtil.isEmpty(newPassword) || ! (Pattern.compile(PASSWORD_VALIDATE_REGEX)).matcher(newPassword).matches() ) {
          throw new RuntimeException(PASSWORD_VALIDATION_ERROR_MESSAGE);
        }
      `
    },
    {
      name: 'checkUser',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          of: 'foam.nanos.auth.User'
        },
        {
          name: 'permission',
          type: 'String'
        }
      ],
      javaCode: `
        return checkUserPermission(x, user, new AuthPermission(permission));
      `
    },
    {
      name: 'updatePassword',
      documentation: `Given a context with a user, validate the password to be
        updated and return a context with the updated user information.`,
      type: 'foam.nanos.auth.User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldPassword',
          type: 'String'
        },
        {
          name: 'newPassword',
          type: 'String'
        }
      ],
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      javaCode: `
        if ( x == null || SafetyUtil.isEmpty(oldPassword) || SafetyUtil.isEmpty(newPassword) ) {
          throw new RuntimeException("Password fields cannot be blank");
        }

        Session session = x.get(Session.class);
        if ( session == null || session.getUserId() == 0 ) {
          throw new AuthenticationException("User not found");
        }

        User user = (User) userDAO_.find(session.getUserId());
        if ( user == null ) {
          throw new AuthenticationException("User not found");
        }

        // check if user enabled
        if ( ! user.getEnabled() ) {
          throw new AuthenticationException("User disabled");
        }

        // check if user login enabled
        if ( ! user.getLoginEnabled() ) {
          throw new AuthenticationException("Login disabled");
        }

        // check if user group enabled
        Group group = (Group) groupDAO_.find(user.getGroup());
        if ( group != null && ! group.getEnabled() ) {
          throw new AuthenticationException("User group disabled");
        }

        // check if password is valid per validatePassword method
        validatePassword(newPassword);

        // old password does not match
        if ( ! Password.verify(oldPassword, user.getPassword()) ) {
          throw new RuntimeException("Old password is incorrect");
        }

        // new password is the same
        if ( Password.verify(newPassword, user.getPassword()) ) {
          throw new RuntimeException("New password must be different");
        }

        // store new password in DAO and put in context
        user = (User) user.fclone();
        user.setPasswordLastModified(Calendar.getInstance().getTime());
        user.setPreviousPassword(user.getPassword());
        user.setPassword(Password.hash(newPassword));
        // TODO: modify line to allow actual setting of password expiry in cases where users are required to periodically update their passwords
        user.setPasswordExpiry(null);
        user = (User) userDAO_.put(user);
        session.setContext(session.getContext().put("user", user));
        return user;
      `
    },
    {
      name: 'validateUser',
      documentation: `Used to validate properties of a user. This will be called
        on registration of users. Will mainly be used as a veto method. Users
        should have id, email, first name, last name, password for registration`,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          of: 'foam.nanos.auth.User'
        },
      ],
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      javaCode: `
        if ( user == null ) {
          throw new AuthenticationException("Invalid User");
        }

        if ( SafetyUtil.isEmpty(user.getEmail()) ) {
          throw new AuthenticationException("Email is required for creating a user");
        }

        if ( ! Email.isValid(user.getEmail()) ) {
          throw new AuthenticationException("Email format is invalid");
        }

        if ( SafetyUtil.isEmpty(user.getFirstName()) ) {
          throw new AuthenticationException("First Name is required for creating a user");
        }

        if ( SafetyUtil.isEmpty(user.getLastName()) ) {
          throw new AuthenticationException("Last Name is required for creating a user");
        }

        if ( SafetyUtil.isEmpty(user.getPassword()) ) {
          throw new AuthenticationException("Password is required for creating a user");
        }

        validatePassword(user.getPassword());
      `
    },
    {
      name: 'logout',
      documentation: `Just return a null user for now. Not sure how to handle
        the cleanup of the current context.`,
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        Session session = x.get(Session.class);
        if ( session != null && session.getUserId() != 0 ) {
          sessionDAO_.remove(session);
        }
      `
    }
  ]
});