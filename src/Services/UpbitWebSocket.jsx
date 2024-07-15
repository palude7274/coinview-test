import { useEffect, useRef } from "react";
import { useCoinData } from '../Context/CoinContext';

const UpbitWebSocket = () => {
    const { coinNameData, setUpbitRealtimeData } = useCoinData();
    const tempDataRef = useRef({});
    const wsRef = useRef(null);

    useEffect(() => {
        const fetchData = () => {
            const ws = new WebSocket(`wss://api.upbit.com/websocket/v1`);
            wsRef.current = ws; // WebSocket 참조 저장

            ws.onopen = () => {
                const codes = coinNameData.map(coin => `KRW-${coin}`);
                ws.send(JSON.stringify([
                    { ticket: "UNIQUE_TICKET_ID" },
                    { type: "ticker", codes: codes }
                ]));
            };

            ws.onmessage = (event) => {
                if (event.data instanceof Blob) {
                    const reader = new FileReader();
                    reader.onload = function () {
                        try {
                            const message = JSON.parse(reader.result);
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
                            console.error("Error parsing Blob data:", error);
                        }
                    };
                    reader.readAsText(event.data);
                } else {
                    console.error("Unexpected data type received:", typeof event.data);
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
            setUpbitRealtimeData(prevData => ({
                ...prevData,
                ...tempDataRef.current
            }));
        }, 2000);

        // 핑-퐁 메커니즘
        const pingIntervalId = setInterval(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: "ping" })); // 핑 메시지 전송
            }
        }, 30000); // 30초마다 핑 전송

        // 컴포넌트 언마운트 시 정리
        return () => {
            clearInterval(intervalId);
            clearInterval(pingIntervalId);
        };

    }, [coinNameData, setUpbitRealtimeData]);

    return null;
};

export default UpbitWebSocket;
