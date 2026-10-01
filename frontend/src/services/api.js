import axios from "axios";

// P2P service
const API = axios.create({
    baseURL: "http://localhost:8081",
});

// P2M service
export const P2M_API = axios.create({
    baseURL: "http://localhost:8082",
});

// Recharge service instances.
// NOTE: this is client-side random instance selection for local demo purposes only,
// not real load balancing. In production this belongs behind an API gateway / load balancer.
const RECHARGE_SERVERS = [
    "http://localhost:8083",
    "http://localhost:8087",
    "http://localhost:8088",
];

export const getRechargeBase = () => {
    const index = Math.floor(Math.random() * RECHARGE_SERVERS.length);
    return RECHARGE_SERVERS[index];
};

// Extracts the backend's error message (ApiError.message) with a fallback
export const getErrorMessage = (err, fallback) =>
    err?.response?.data?.message || fallback;

export default API;
