import { createI18n } from 'vue-i18n'

import vi from './vi.json'
import en from './en.json'
import zh from './zh.json'
import fil from './fil.json'

export const i18n = createI18n({
  legacy: false,
  locale: 'vi',
  fallbackLocale: 'vi',
  messages: {
    vi,
    en,
    zh,
    fil
  }
})
