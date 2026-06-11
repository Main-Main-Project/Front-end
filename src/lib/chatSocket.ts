import { getAccessToken } from "@/lib/tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function toWsBaseUrl(httpUrl: string) {
    if (httpUrl.startsWith("https://")) return httpUrl.replace("https://", "wss://");
    return httpUrl.replace("http://", "ws://");
}

export function connectChatSocket(sessionId?: string) {
    const token = getAccessToken();

    if (!token) {
        throw new Error("로그인이 필요합니다.");
    }

    const wsBaseUrl = toWsBaseUrl(API_BASE_URL);
    const url = new URL(`${wsBaseUrl}/ws/chat`);
    url.searchParams.set("token", token);

    if (sessionId) {
        url.searchParams.set("session_id", sessionId);
    }

    return new WebSocket(url.toString());
}