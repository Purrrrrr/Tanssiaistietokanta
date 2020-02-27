import {useMemo} from 'react';
import * as yup from 'yup';

window.yup = yup;

/* eslint-disable no-template-curly-in-string */
yup.setLocale({
  mixed: {
    default: 'Tarkista arvo',
    required: ({value}) => {
      return Array.isArray(value)
        ? 'Kentän täytyy sisältää ainakin yksi arvo'
        : 'Täytä kenttä';
    },
  },
  string: {
    min: 'Syötä ainakin ${min} merkkiä',
    max: 'Syötä korkeintaan ${max} merkkiä',
  },
  number: {
    min: 'Pitää olla ainakin ${min}',
    max: 'Saa olla korkeintaan ${max}',
  },
});
/* eslint-enable no-template-curly-in-string */

export function useSchema({validator, type = "string", required, min, max, nullable}) {
  return useMemo(
    () => validator ?? getSchema(type, {required, min, max, nullable}),
    [validator, type, required, min, max, nullable]
  );
}

function getSchema(type, spec) {
  let schema = yup[type]();
  for(const [key, val] of Object.entries(spec)) {
    if (val === undefined) continue;
    if (noArguments[key]) {
      schema = schema[key]();
    } else {
      schema = schema[key](val);
    }
  }
  return schema;
}

const noArguments = {
  required: true
};
