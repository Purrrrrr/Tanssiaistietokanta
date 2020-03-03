import * as yup from 'yup';
export default yup;

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
