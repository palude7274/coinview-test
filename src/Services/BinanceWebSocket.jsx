import { useEffect, useRef } from "react";
import { useCoinData } from '../Context/CoinContext';

const BinanceWebSocket = () => {
    const { coinNameData, setBinanceRealtimeData } = useCoinData();
    const tempDataRef = useRef({});

    useEffect(() => {
        const fetchData = () => {
            const ws = new WebSocket(`wss://stream.binance.com:9443/ws`);

            const subscribeMsg = {
                method: "SUBSCRIBE",
                params: coinNameData.map(coin => `${coin.toLowerCase()}usdt@ticker`),
                id: 1
            };

            ws.onopen = () => {
                ws.send(JSON.stringify(subscribeMsg));
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);

                    // 구독 확인 메시지 처리
                    if (message.result === null && message.id) {
                        console.log("Subscription confirmed:", message);
                        return;
                    }

                    // 실제 티커 데이터 처리
                    if (message && message.s && message.c) {
                        const coinName = message.s.replace("USDT", "");
                        const binancePrice = parseFloat(message.c);

                        tempDataRef.current[coinName] = {
                            binancePrice: binancePrice
                        };
                    } else {
                        console.log("Received message:", message);
                    }
                } catch (error) {
                    console.error("Error processing message:", error);
                }
            };


            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            ws.onclose = () => {
                console.log("WebSocket closed!");
            };

            return () => {
                ws.close();
            };
        };

        if (coinNameData.length > 0) {
            fetchData();
        }

        // 2초마다 데이터 업데이트
        const intervalId = setInterval(() => {
            setBinanceRealtimeData(prevData => ({
                ...prevData,
                ...tempDataRef.current
            }));
        }, 2000);

        // 컴포넌트 언마운트 시 정리
        return () => {
            clearInterval(intervalId);
        };

    }, [coinNameData, setBinanceRealtimeData]);

    return null;
};

export default BinanceWebSocket;