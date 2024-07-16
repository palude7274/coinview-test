import { useEffect, useRef, useCallback } from "react";
import { useCoinData } from '../Context/CoinContext';

const BinanceWebSocket = () => {
    const { validBinanceCoins, setBinanceRealtimeData } = useCoinData();
    const tempDataRef = useRef({});
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const connect = useCallback(() => {
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws`);
        wsRef.current = ws;

        const subscribeMsg = {
            method: "SUBSCRIBE",
            params: validBinanceCoins.map(coin => `${coin.toLowerCase()}usdt@ticker`),
            id: 1
        };

        ws.onopen = () => {
            console.log("Binance WebSocket connected");
            ws.send(JSON.stringify(subscribeMsg));
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                if (message.result === null && message.id) {
                    console.log("Subscription confirmed:", message);
                    return;
                }

                if (message && message.s && message.c) {
                    const coinName = message.s.replace("USDT", "");
                    const binancePrice = parseFloat(message.c);
                    const priceChangePercent = parseFloat(message.P);
                    const volume = parseFloat(message.v);

                    tempDataRef.current[coinName] = {
                        binancePrice: binancePrice,
                        priceChangePercent: priceChangePercent,
                        volume: volume
                    };
                } else if (message.e === "pingpong") {
                    console.log("Received pong from Binance server");
                } else {
                    console.log("Received message:", message);
                }
            } catch (error) {
                console.error("Error processing message:", error, "Raw data:", event.data);
            }
        };

        ws.onerror = (error) => {
            console.error("Binance WebSocket error:", error);
        };

        ws.onclose = (event) => {
            console.log("Binance WebSocket closed with code:", event.code);
            reconnectTimeoutRef.current = setTimeout(() => connect(), 5000);
        };

        return ws;
    }, [validBinanceCoins]);

    useEffect(() => {
        if (validBinanceCoins.length > 0) {
            const ws = connect();

            const intervalId = setInterval(() => {
                setBinanceRealtimeData(prevData => ({
                    ...prevData,
                    ...tempDataRef.current
                }));
            }, 3000);

            const pingIntervalId = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ method: "ping" }));
                }
            }, 30000);

            return () => {
                clearInterval(intervalId);
                clearInterval(pingIntervalId);
                clearTimeout(reconnectTimeoutRef.current);
                ws.close();
            };
        }
    }, [validBinanceCoins, setBinanceRealtimeData, connect]);

    return null;
};

export default BinanceWebSocket;