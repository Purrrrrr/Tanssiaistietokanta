import { LEXICAL_KEY_MAPPING } from './constants'
import { applyExpandKey, applyMinifyKey } from './keyMap'

export const minifyKey = (key: string) => applyMinifyKey(LEXICAL_KEY_MAPPING, key)
export const expandKey = (key: string) => applyExpandKey(LEXICAL_KEY_MAPPING, key)
