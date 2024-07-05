import { useEffect } from "react";

const BinanceWebSocket = ({setLastBinancePrice}) => {
    useEffect(() => {
        const fetchData = () => {
            const ws = new WebSocket(`wss://stream.binance.com:9443/ws`);

            // 구독 요청 메시지
            const subscribeMsg = {
                method: "SUBSCRIBE",
                params: [
                    "btcusdt@ticker" // btcusdt 페어의 가격 업데이트 구독
                ],
                id: 1
            };

            ws.onopen = () => {
                ws.send(JSON.stringify(subscribeMsg));
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                const binancePrice = parseFloat(message.c);
                setLastBinancePrice(binancePrice);
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
        
        fetchData();
    }, [setLastBinancePrice]);

    return null; // 또는 필요에 따라 다른 JSX를 반환할 수 있습니다.
};

export default BinanceWebSocket;
