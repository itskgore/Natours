import '@babel/polyfill';
import { showAlert } from './alert';
import axios from 'axios';
// type is ['password /  data']
export const updateSettings = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url:
        type === 'data'
          ? 'http://127.0.0.1:3000/api/v1/users/update-me'
          : 'http://127.0.0.1:3000/api/v1/users/update-password',
      data
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} User Details Updated`);
      window.setTimeout(() => {
        location.reload(true); // reload from server very important
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
