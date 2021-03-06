

const _ = require('lodash');
const cacheTimes = require('../config/cache-times');
const Joi = require('joi');
const auth = require('../lib/authentications');
const joiValidator = require('./validations/dojos')();
const handlerFactory = require('./handlers.js');

exports.register = function (server, eOptions, next) {
  const options = _.extend({ basePath: '/api/2.0' }, eOptions);
  const handlers = handlerFactory(server, 'cd-dojos');

  server.route([{
    method: 'GET',
    path: `${options.basePath}/dojos/config`,
    handler: handlers.actHandler('get_dojo_config'),
    config: {
      description: 'Config endpoint',
      notes: 'Returns the dojo configuration',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK' },
          ],
        },
      },
      cors: { origin: ['*'], credentials: false },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/search-bounding-box`,
    handler: handlers.actHandler('search_bounding_box'),
    config: {
      description: 'Search dojos',
      notes: 'Search dojos located in a bounding box area',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      cors: { origin: ['*'], credentials: false },
      validate: {
        payload: Joi.object({ query: {
          lat: joiValidator.latitude().required(),
          lon: joiValidator.longitude().required(),
          radius: Joi.number().min(0).required(),
          search: Joi.string(),
        } }),
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/find`,
    handler: handlers.actHandler('find'),
    config: {
      description: 'Find',
      notes: 'Find',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      cors: { origin: ['*'], credentials: false },
      validate: {
        payload: Joi.object({ query: {
          urlSlug: Joi.string().required(),
        } }),
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/search`,
    handler: handlers.actHandlerNeedsUser('search'),
    config: {
      auth: auth.apiUser,
      description: 'Search dojos for manage dojos page',
      notes: 'Only accessible by cdf-admins',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        payload: Joi.object({ query: {
          name: Joi.string().optional(),
          verified: Joi.number().integer().optional(),
          email: Joi.string().optional(),
          creatorEmail: Joi.string().optional(),
          stage: Joi.alternatives(Joi.number().integer(), Joi.object()),
          deleted: Joi.number().integer().optional(),
          alpha2: joiValidator.alpha2().optional().description('two capital letters representing the country'),
          dojoLeadId: Joi.alternatives(Joi.number().integer(), Joi.object()),
          limit$: Joi.number().integer().min(0).optional(),
          skip$: Joi.number().integer().min(0).optional(),
          sort$: Joi.object().keys({
            created: Joi.number().valid(-1).valid(1).optional(),
            name: Joi.number().valid(-1).valid(1).optional(),
            stage: Joi.number().valid(-1).valid(1).optional(),
            alpha2: Joi.number().valid(-1).valid(1).optional(),
            email: Joi.number().valid(-1).valid(1).optional(),
            verifiedAt: Joi.number().valid(-1).valid(1).optional(),
            updatedAt: Joi.number().valid(-1).valid(1).optional(),
            ctid: Joi.number().valid(-1).valid(1).optional(),
          }),
        } }),
      },
    },
  },
  {
    method: 'POST',
    path: `${options.basePath}/dojos/verified`,
    handler: handlers.actHandlerNeedsUser('bulkVerify'),
    config: {
      auth: auth.apiUser,
      description: 'bulk',
      notes: 'bulk',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        payload: Joi.object({ dojos:
          Joi.array().items(Joi.object().keys({
            id: joiValidator.guid(),
            verified: Joi.number().valid(0).valid(1),
          })),
        }),
      },
    },
  },
  {
    method: 'POST',
    path: `${options.basePath}/dojos/{dojoId}/avatar`,
    handler: handlers.actHandlerNeedsUser('update_image', ['dojoId', 'avatar']),
    config: {
      auth: auth.apiUser,
      description: 'Update Dojo\'s avatar',
      notes: 'Update a dojo\'s avatar by Id to S3',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK' },
          ],
        },
      },
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data',
      },
      validate: {
        payload: Joi.any().required(),
        params: {
          dojoId: Joi.string().guid().required(),
        },
      },
    },

  }, {
    method: 'DELETE',
    path: `${options.basePath}/dojos/{dojoId}`,
    handler: handlers.actHandlerNeedsUser('delete', 'dojoId', null, { ctrl: 'dojo' }),
    config: {
      auth: auth.apiUser,
      description: 'Delete dojo',
      notes: 'Delete a dojo providing the dojo id',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        params: {
          dojoId: Joi.string().guid().required(),
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/by-country`,
    handler: handlers.actHandler('dojos_by_country'),
    config: {
      description: 'ByCountry',
      notes: 'ByCountry',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      cors: { origin: ['*'], credentials: false },
      validate: {
        payload: Joi.object({ query: {
          verified: Joi.number().valid(0).valid(1).required(),
          deleted: Joi.number().valid(0).valid(1).required(),
          stage: Joi.alternatives(Joi.object(), Joi.number().integer()),
          alpha2: joiValidator.alpha2(),
          continent: joiValidator.continent(),
        } }),
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos`,
    handler: handlers.actHandler('list'),
    config: {
      description: 'List',
      notes: 'List',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      cors: { origin: ['*'], credentials: false },
      validate: {
        payload: Joi.object({ query: {
          id: Joi.alternatives(
            Joi.string().guid(),
            Joi.object().keys({
              nin$: Joi.array().items(Joi.string().guid()),
              in$: Joi.array().items(Joi.string().guid()),
            }),
          ),
          mysqlDojoId: Joi.alternatives(Joi.string(), Joi.number()),
          ids: Joi.array().items(Joi.string().guid()),
          name: Joi.string(),
          verified: Joi.number().valid(0).valid(1),
          stage: Joi.alternatives(
            Joi.number().integer(),
            Joi.object({
              ne$: Joi.number(),
            }),
          ),
          deleted: Joi.number().valid(0).valid(1),
          alpha2: joiValidator.alpha2(),
          fields$: Joi.array().items(Joi.string()),
          dojoLeadId: Joi.alternatives(
            Joi.string().guid(),
            Joi.object().keys({
              nin$: Joi.array().items(Joi.string().guid()),
              in$: Joi.array().items(Joi.string().guid()),
            }),
          ),
          sort$: Joi.object({
            name: Joi.number().valid(-1).valid(1),
          }).optional(),
        } }),
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/user/dojos`,
    handler: handlers.actHandlerNeedsUser('joinedDojos', null, null, { ctrl: 'dojo' }),
    config: {
      auth: auth.apiUser,
      description: 'Current user\'s joined dojos',
      notes: 'Current user\'s joined dojos',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        payload: Joi.object({ query: {
          sort$: Joi.object().keys({
            created: Joi.number().valid(0).valid(1),
          }),
          verified: Joi.number().integer(),
          skip$: Joi.number().integer().min(0),
          limit$: Joi.number().integer().min(0),
        } }),
      },
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/dojos/{id}`,
    handler: handlers.actHandler('load', 'id'),
    config: {
      description: 'dojos',
      notes: 'dojos',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK' },
          ],
        },
      },
      cors: { origin: ['*'], credentials: false },
      validate: {
        params: {
          id: Joi.string().required(),
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/bulk-delete`,
    handler: handlers.actHandlerNeedsUser('bulk_delete'),
    config: {
      auth: auth.apiUser,
      description: 'bulk',
      notes: 'bulk',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        payload: Joi.object({ dojos:
          Joi.array().items(Joi.object().keys({
            id: joiValidator.guid(),
            creator: joiValidator.guid(),
            dojoLeadId: joiValidator.guid(),
          })),
        }),
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/stats`,
    handler: handlers.actHandlerNeedsUser('get_stats'),
    config: {
      auth: auth.apiUser,
      description: 'get stats',
      notes: 'get stats',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        payload: {},
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/users`,
    handler: handlers.actHandlerNeedsUser('load_usersdojos'),
    config: {
      auth: auth.apiUser,
      description: 'dojo users',
      notes: 'dojo users',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        payload: Joi.object({ query: {
          dojoId: Joi.alternatives().try(
            joiValidator.guid(),
            Joi.string().valid(''),
            Joi.object().keys({
              nin$: Joi.array().items(Joi.string().guid()),
              in$: Joi.array().items(Joi.string().guid()),
            }),
          ),
          userId: joiValidator.guid(),
          deleted: Joi.number().valid(0).valid(1),
          owner: Joi.number().valid(1).valid(0),
          limit$: Joi.number().integer().min(0).optional(),
          skip$: Joi.number().integer().min(0).optional(),
        } }),
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/load-dojo-users`,
    handler: handlers.actHandlerNeedsDojoAdmin('load_dojo_users'),
    config: {
      auth: auth.apiUser,
      description: 'dojo users',
      notes: 'dojo users',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        payload: Joi.object({ query: {
          dojoId: joiValidator.guid().required(),
          deleted: Joi.number().valid(0).valid(1),
          limit$: Joi.alternatives().try(Joi.number().integer().min(0), Joi.string()),
          skip$: Joi.number().integer().min(0).optional(),
          sort$: Joi.object().keys({
            name: Joi.number().valid(-1).valid(1).optional(),
            email: Joi.number().valid(-1).valid(1).optional(),
          }),
          fields: Joi.array().items('gender').optional(),
          userType: Joi.string(),
          name: Joi.string(),
        } }),
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/generate-user-invite-token`,
    handler: handlers.actHandlerNeedsUser('generate_user_invite_token'),
    config: {
      auth: auth.apiUser,
      description: 'user invite token',
      notes: 'user invite token',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' }],
        },
      },
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          emailSubject: Joi.string().valid('New Dojo Invitation').required(),
          userType: Joi.string().required(),
          dojoId: Joi.string().guid().required(),
        }),
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/accept-user-invite`,
    handler: handlers.actHandlerNeedsUser('accept_user_invite'),
    config: {
      auth: auth.apiUser,
      description: 'accept invite',
      notes: 'accept invite',
      tags: ['api', 'dojos'],
      validate: {
        payload: {
          data: {
            currentUserId: Joi.string().guid().required(),
            currentUserEmail: Joi.string().email().allow(null).optional(), // unused
            inviteToken: Joi.string().required(),
            dojoId: Joi.string().guid().required(),
          },
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/request-user-invite`,
    handler(request, response) {
      // Hotfix for joining Dojo as a Mentor/Champion
      // TODO: Discover where else this is a problem, and fix it on a more global scale.
      delete request.payload.data.user.lmsId;
      delete request.payload.data.user.profileId;
      return handlers.actHandlerNeedsUser('request_user_invite')(request, response);
    },
    config: {
      auth: auth.apiUser,
      description: 'request invite',
      notes: 'request invite',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' }],
        },
      },
      validate: {
        payload: Joi.object({ data: {
          user: joiValidator.user().required(),
          dojoId: joiValidator.guid().required(),
          userType: Joi.string().required(),
          emailSubject: Joi.string().valid('New Request to join your Dojo').required(),
        } }),
      },
    },
  }, {
    method: 'PUT',
    path: `${options.basePath}/dojos/{dojoId}/request/{inviteToken}/user/{requestedByUser}`,
    handler: handlers.actHandlerNeedsUser('accept_user_request', ['dojoId', 'inviteToken', 'requestedByUser']),
    config: {
      auth: auth.apiUser,
      description: 'Accept request from a user to join the dojo',
      notes: 'Accept request from a user to join the dojo',
      tags: ['api', 'dojos'],
      validate: {
        params: {
          dojoId: Joi.string().guid().allow('null'),
          requestedByUser: Joi.string().required(),
          inviteToken: Joi.string().required(),
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: `${options.basePath}/dojos/{dojoId}/request/{inviteToken}/user/{requestedByUser}`,
    handler: handlers.actHandlerNeedsUser('decline_join_request', ['dojoId', 'inviteToken', 'requestedByUser']),
    config: {
      auth: auth.apiUser,
      description: 'Decline request from a user to join the dojo',
      notes: 'Decline request from a user to join the dojo',
      tags: ['api', 'dojos'],
      validate: {
        params: {
          dojoId: Joi.string().guid().required(),
          requestedByUser: Joi.string().required(),
          inviteToken: Joi.string().required(),
        },
      },
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/dojos/dojos-for-user/{id}`,
    handler: handlers.actHandler('dojos_for_user', 'id'),
    config: {
      auth: auth.userIfPossible,
      description: 'dojos for user',
      notes: 'dojos for user',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        params: {
          id: Joi.string().guid().required(),
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/save-usersdojos`,
    handler: handlers.actHandlerNeedsUser('save_usersdojos'),
    config: {
      auth: auth.apiUser,
      description: 'save user dojos',
      notes: 'save user dojos',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' }],
        },
      },
      validate: {
        payload: Joi.object({ userDojo: {
          entity$: Joi.string(),
          id: joiValidator.guid(),
          mysqlUserId: Joi.any(),
          mysqlDojoId: Joi.any(),
          owner: Joi.number().valid(1).valid(0),
          userId: joiValidator.guid(),
          dojoId: joiValidator.guid(),
          userTypes: Joi.array(),
          userPermissions: Joi.alternatives().try(Joi.array(), Joi.string().valid(null)),
          backgroundChecked: Joi.boolean(),
          deleted: Joi.number().valid(0).valid(1),
          deletedBy: Joi.any(),
          deletedAt: Joi.any(),
        } }),
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/remove-usersdojos/{userId}/{dojoId}`,
    handler: handlers.actHandlerNeedsUser('remove_usersdojos', ['userId', 'dojoId']),
    config: {
      auth: auth.apiUser,
      description: 'remove user dojos',
      notes: 'remove user dojos',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        params: {
          userId: Joi.string().guid().required(),
          dojoId: Joi.string().guid().required(),
        },
        payload: {
          data: {
            // userId and dojoId are required, but ignored. Only the params are being used
            userId: Joi.string().guid().required(),
            dojoId: Joi.string().guid().required(),
            emailSubject: Joi.string().required(),
          },
        },
      },
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/dojos/user-permissions`,
    handler: handlers.actHandler('get_user_permissions'),
    config: {
      description: 'user permissions',
      notes: 'user permissions',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK' },
          ],
        },
      },
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/dojos/user-types`,
    handler: handlers.actHandler('get_user_types'),
    config: {
      description: 'user types',
      notes: 'user types',
      tags: ['api', 'dojos'],
      cors: { origin: ['*'], credentials: false },
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK' },
          ],
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/update-founder`,
    handler: handlers.actHandlerNeedsUser('update_founder'),
    config: {
      auth: auth.apiUser,
      description: 'update founder',
      notes: 'update founder',
      tags: ['api', 'dojos'],
      validate: {
        payload: {
          founder: Joi.object({
            id: Joi.string().guid().required(),
            previousFounderId: Joi.string().guid().required(),
            dojoId: Joi.string().guid().required(),
          }),
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/search-nearest-dojos`,
    handler: handlers.actHandler('search_nearest_dojos'),
    config: {
      description: 'search nearest dojo',
      notes: 'search nearest dojo',
      tags: ['api', 'dojos'],
      cors: { origin: ['*'], credentials: false },
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        payload: Joi.object({ query: {
          lat: joiValidator.latitude().required(),
          lon: joiValidator.longitude().required(),
          search: Joi.string().required(),
        } }),
      },
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/countries`,
    handler: handlers.actHandler('list_countries'),
    config: {
      cache: {
        expiresIn: cacheTimes.long,
      },
      description: 'list countries',
      notes: 'list countries',
      tags: ['api', 'dojos'],
      cors: { origin: ['*'], credentials: false },
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK' },
          ],
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/countries/places`,
    handler: handlers.actHandler('list_places'),
    config: {
      description: 'list places',
      notes: 'list places',
      tags: ['api', 'dojos'],
      cors: { origin: ['*'], credentials: false },
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 400, message: 'Bad Request' },
            { code: 200, message: 'OK' }],
        },
      },
      validate: {
        payload: Joi.object({ search: {
          countryCode: joiValidator.alpha2().required(),
          search: Joi.string().required(),
        } }),
      },
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/countries/lat-long`,
    handler: handlers.actHandler('countries_lat_long'),
    config: {
      cache: {
        expiresIn: cacheTimes.long,
      },
      description: 'countries lat long',
      notes: 'countries lat long',
      tags: ['api', 'dojos'],
      cors: { origin: ['*'], credentials: false },
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK' },
          ],
        },
      },
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/countries/continents/codes`,
    handler: handlers.actHandler('continent_codes'),
    config: {
      cache: {
        expiresIn: cacheTimes.long,
      },
      description: 'continent codes',
      notes: 'continent codes',
      tags: ['api', 'dojos'],
      cors: { origin: ['*'], credentials: false },
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK' },
          ],
        },
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/notify-all-members`,
    handler: handlers.actHandlerNeedsUser('notify_all_members'),
    config: {
      auth: auth.apiUser,
      description: 'notify all dojo members',
      notes: 'notify all dojo members',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK' }],
        },
      },
      validate: {
        payload: Joi.object({ data: {
          dojoId: Joi.string().guid().required(),
          eventId: Joi.string().guid().required(),
          emailSubject: Joi.string().valid('Tickets Now Available for %1$s').required(),
        } }),
      },
    },
  }, {
    method: 'POST',
    path: `${options.basePath}/dojos/{dojoId}/users/notifications`,
    handler: handlers.actHandlerNeedsUser('notify_dojo_members', ['dojoId']),
    config: {
      auth: auth.apiUser,
      description: 'Notify selected dojo members with a custom message',
      notes: 'Notify selected dojo members',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK' }],
        },
      },
      validate: {
        payload: Joi.object({
          userIds: Joi.array().items(Joi.string()).required(),
          data: {
            subject: Joi.string().required(),
            content: Joi.string().required(),
          },
        }),
      },
    },
  }, {
    method: 'GET',
    path: `${options.basePath}/dojos/export-users/{dojoId}-user-export.csv`,
    handler: handlers.actHandlerNeedsDojoAdmin('export_dojo_users', 'dojoId', 'csv'),
    config: {
      auth: auth.apiUser,
      description: 'export dojo users',
      notes: 'dojos users',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        params: {
          dojoId: Joi.string().guid().required(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: `${options.basePath}/dojos/{dojoId}/requests`,
    //  userType and name are passed as query params
    handler: handlers.actHandler('search_join_requests', ['dojoId', 'userType', 'name']),
    config: {
      auth: auth.apiUser,
      description: 'Search join requests for a dojo',
      notes: 'dojos pending users',
      tags: ['api', 'dojos'],
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            { code: 200, message: 'OK' },
          ],
        },
      },
      validate: {
        params: {
          dojoId: Joi.string().guid().required(),
        },
        query: {
          userType: Joi.string(),
          name: Joi.string(),
        },
      },
    },
  }]);

  next();
};

exports.register.attributes = {
  name: 'api-dojos',
  dependencies: 'cd-auth',
};
