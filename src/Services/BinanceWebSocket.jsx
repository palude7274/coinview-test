import { useEffect, useRef } from "react";
import { useCoinData } from '../Context/CoinContext';

const BinanceWebSocket = () => {
    const { coinNameData, setBinanceRealtimeData } = useCoinData();
    const tempDataRef = useRef({});
    const wsRef = useRef(null); // WebSocket 참조 저장

    useEffect(() => {
        const fetchData = () => {
            const ws = new WebSocket(`wss://stream.binance.com:9443/ws`);
            wsRef.current = ws; // WebSocket 인스턴스 저장

            const subscribeMsg = {
                method: "SUBSCRIBE",
                params: coinNameData.map(coin => `${coin.toLowerCase()}usdt@ticker`),
                id: 1
            };

            ws.onopen = () => {
                ws.send(JSON.stringify(subscribeMsg)); // 구독 메시지 전송
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);

                    // 구독 확인 메시지 처리
                    if (message.result === null && message.id) {
                        console.log("구독 확인됨:", message);
                        return;
                    }

                    // 실제 티커 데이터 처리
                    if (message && message.s && message.c) {
                        const coinName = message.s.replace("USDT", ""); // 코인 이름 추출
                        const binancePrice = parseFloat(message.c); // 가격 변환

                        // 임시 객체에 데이터 저장
                        tempDataRef.current[coinName] = {
                            binancePrice: binancePrice
                        };
                    } else {
                        console.log("수신된 메시지:", message);
                    }
                } catch (error) {
                    console.error("메시지 처리 오류:", error);
                }
            };

            ws.onerror = (error) => {
                console.error("WebSocket 오류:", error);
            };

            ws.onclose = () => {
                console.log("WebSocket 종료됨!");
            };

            return () => {
                ws.close(); // 컴포넌트 언마운트 시 WebSocket 종료
            };
        };

        if (coinNameData.length > 0) {
            fetchData();
        }

        // 3초마다 데이터 업데이트
        const intervalId = setInterval(() => {
            setBinanceRealtimeData(prevData => ({
                ...prevData,
                ...tempDataRef.current
            }));
        }, 3000);

        // 핑-퐁 메커니즘
        const pingIntervalId = setInterval(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: "ping" })); // 핑 메시지 전송
            }
        }, 60000); // 60초마다 핑 전송

        // 컴포넌트 언마운트 시 정리
        return () => {
            clearInterval(intervalId);
            clearInterval(pingIntervalId);
        };

    }, [coinNameData, setBinanceRealtimeData]);

    return null;
};

export default BinanceWebSocket;
