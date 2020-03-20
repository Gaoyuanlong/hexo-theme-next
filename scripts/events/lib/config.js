'use strict';

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function merge(target, source) {
  for (const key in source) {
    if (isObject(target[key]) && isObject(source[key])) {
      merge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

module.exports = hexo => {
  let data = hexo.locals.get('data');

  /**
   * Merge configs from _data/next.yml into hexo.theme.config.
   * If `override`, configs in next.yml will rewrite configs in hexo.theme.config.
   */
  if (data.next) {
    if (data.next.override) {
      hexo.theme.config = data.next;
    } else {
      merge(hexo.config, data.next);
      merge(hexo.theme.config, data.next);
    }
  }

  if (hexo.theme.config.cache && hexo.theme.config.cache.enable && hexo.theme.language_switcher) {
    hexo.log.warn('Since `language_switcher` is turned on, the caching is disabled to avoid potential hazards.');
    hexo.theme.config.cache.enable = false;
  }
  if (hexo.theme.config.cache && hexo.theme.config.cache.enable && hexo.config.relative_link) {
    hexo.log.warn('Since caching is turned on, the `relative_link` option in Hexo `_config.yml` is set to `false` to avoid potential hazards.');
    hexo.config.relative_link = false;
  }
  hexo.config.meta_generator = false;

  // Custom languages support. Introduced in NexT v6.3.0.
  if (data.languages) {
    var { language } = hexo.config;
    var { i18n } = hexo.theme;

    var mergeLang = lang => {
      i18n.set(lang, merge(i18n.get([lang]), data.languages[lang]));
    };

    if (Array.isArray(language)) {
      for (let lang of language) {
        mergeLang(lang);
      }
    } else {
      mergeLang(language);
    }
  }
};
