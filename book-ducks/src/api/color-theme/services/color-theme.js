'use strict';

/**
 * color-theme service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::color-theme.color-theme');
