import axios from "axios";

const baseUrl = 'http://localhost:9090';
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

export async function regis(data) {
    const res = await instance.post(`/users`, data);
    return res;
}
export async function login(data) {
    const res = await instance.post(`/login`, data);
    return res;
}
