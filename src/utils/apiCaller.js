import axios from 'axios';

module.exports = (URL, method, headers, data) => {
  return axios({
    method,
    url: URL,
    headers,
    data
  });
};