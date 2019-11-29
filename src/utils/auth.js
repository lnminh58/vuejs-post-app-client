import { get } from 'lodash';
import jwtDecode from 'jwt-decode';
import moment from 'moment';

import store from '../store';

export const isTokenValid = () => {
  const currentUser = get(store, 'getters.currentUser');
  const token = get(currentUser, 'token');
  let isValid = true;
  if (token) {
    const decoded = jwtDecode(token);
    const { exp } = decoded;
    isValid = moment(exp * 1000).isAfter(moment().startOf('s'));
  }
  return isValid;
};

// export const isNeedRefreshToken = () => {
//   const currentUser = get(store, 'getters.currentUser');
//   const token = get(currentUser, 'token');
//   if (token) {
//     const decoded = jwtDecode(token);
//     const { exp } = decoded;
//     return moment(exp * 1000).diff(moment().startOf('s'), 's') < 30;
//   }
// }
