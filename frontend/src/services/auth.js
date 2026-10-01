// import axios from "axios";
//
// const BASE_URL = "http://localhost:8080"; // login service
//
// export const loginUser = async (userId) => {
//     const res = await axios.post(`${BASE_URL}/login?userId=${userId}`);
//
//     const token = res.data;
//     localStorage.setItem("token", token);
//
//     return token;
// };