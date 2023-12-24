import axios from "axios";

const baseUrl = 'http://localhost:5000';
const instance = axios.create({
    baseURL: baseUrl,
    method: 'get',
});
axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    console.log(response)
    return response;
  }, function (error) {
    console.log(error)
    return Promise.reject(false);
  });
export async function rollcall(data) {
  const res = await instance.post(`/rollcall`, data);
  return res;
}