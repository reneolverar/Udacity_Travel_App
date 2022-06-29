import { handleSubmit } from './js/handleSubmit.js';
import { saveSession } from './js/handleSubmit.js';
import { printHTML } from './js/printHTML.js';
import print from 'print-js';
import { getApiKeys } from './js/apiCalls.js';
import { getGeonames } from './js/apiCalls.js';
import { getPixabay } from './js/apiCalls.js';
import { getWeatherbit } from './js/apiCalls.js';

import './styles/resets.scss'
import './styles/base.scss'
import './styles/footer.scss'
import './styles/form.scss'
import './styles/header.scss'
import './styles/layouts.scss'

export {
    handleSubmit,
    saveSession,
    printHTML,
    print,
    getApiKeys,
    getGeonames,
    getPixabay,
    getWeatherbit
}