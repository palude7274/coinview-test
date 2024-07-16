import { useEffect, useRef, useCallback } from "react";
import { useCoinData } from '../Context/CoinContext';

const UpbitWebSocket = () => {
    const { coinNameData, setUpbitRealtimeData } = useCoinData();
    const tempDataRef = useRef({});
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const connect = useCallback(() => {
        const ws = new WebSocket(`wss://api.upbit.com/websocket/v1`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connected");
            const codes = coinNameData.map(coin => `KRW-${coin}`);
            const subscribeMsg = JSON.stringify([
                { ticket: "UNIQUE_TICKET_ID" },
                { type: "ticker", codes: codes }
            ]);
            ws.send(subscribeMsg);
        };

        ws.onmessage = (event) => {
            if (event.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = function () {
                    try {
                        const message = JSON.parse(reader.result);

                        // 오류 메시지 처리
                        if (message.error) {
                            console.error("Server error:", message.error);
                            if (message.error.name === "WRONG_FORMAT") {
                                console.log("Attempting to reconnect with modified subscription...");
                                ws.close(); // 현재 연결 종료
                                setTimeout(() => connect(), 5000); // 5초 후 재연결 시도
                            }
                            return;
                        }

                        // 정상 메시지 처리
                        const coinName = message.code.replace("KRW-", "");
                        const upbitPrice = message.trade_price;
                        const accTradePrice24 = message.acc_trade_price_24h;
                        const billion = accTradePrice24 / 100000000;
                        const formattedBillion = billion.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
                        const dod = (message.signed_change_rate) * 100;
                        const dodFormatted = dod.toFixed(2);

                        // 임시 객체에 데이터 저장
                        tempDataRef.current[coinName] = {
                            upbitPrice: upbitPrice,
                            accTradePrice24: formattedBillion,
                            dayOverDay: dodFormatted
                        };
                    } catch (error) {
                        console.error("Error parsing Blob data:", error, "Raw data:", reader.result);
                    }
                };
                reader.readAsText(event.data);
            } else if (typeof event.data === 'string' && event.data === 'pong') {
                console.log("Received pong from server");
            } else {
                console.error("Unexpected data type received:", typeof event.data);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = (event) => {
            console.log("WebSocket closed with code:", event.code);
            reconnectTimeoutRef.current = setTimeout(() => connect(), 5000);
        };

        return ws;
    }, [coinNameData]);

    useEffect(() => {
        if (coinNameData.length > 0) {
            const ws = connect();

            const intervalId = setInterval(() => {
                setUpbitRealtimeData(prevData => ({
                    ...prevData,
                    ...tempDataRef.current
                }));
            }, 2000);

            const pingIntervalId = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "ping" }));
                }
            }, 30000);

            return () => {
                clearInterval(intervalId);
                clearInterval(pingIntervalId);
                clearTimeout(reconnectTimeoutRef.current);
                ws.close();
            };
        }
    }, [coinNameData, setUpbitRealtimeData, connect]);

    return null;
};

export default UpbitWebSocket;