import axios from "axios";

// ✅ P2P (OLD WORKING)
const API = axios.create({
    baseURL: "http://localhost:8080"
});

// ✅ P2M (agar use kar rahe ho)
export const P2M_API = axios.create({
    baseURL: "http://localhost:8082"
});

// ✅ Recharge (NEW)
// multiple instances (load balancing)
const RECHARGE_SERVERS = [
    "http://localhost:8083",
    "http://localhost:8087",
    "http://localhost:8088"
];

// random server select
export const getRechargeBase = () => {
    const random = Math.floor(Math.random() * RECHARGE_SERVERS.length);
    return RECHARGE_SERVERS[random];
};

// 🔥 THIS LINE WAS MISSING
export default API;