import { useEffect } from "react";

const UpbitWebSoket = ({ setLatestTradePrice, setLastCoinName, setLastTradePrice24, setDeyOfDey }) => {
    useEffect(() => {
        const fetchData = () => {
            const ws = new WebSocket(`wss://api.upbit.com/websocket/v1`);
            ws.onopen = () => {
                ws.send('[{"ticket":"UNIQUE_TICKET_ID"},{"type":"ticker","codes":["KRW-BTC"]}]');
            };

            ws.onmessage = (event) => {
                if (event.data instanceof Blob) {
                    const reader = new FileReader();
                    reader.onload = function () {
                        try {
                            const message = JSON.parse(reader.result);
                            const coinName = message.code;
                            const extractedCoinName = coinName.replace("KRW-", "");
                            const tradePrice = message.trade_price;
                            const accTradePrice24 = message.acc_trade_price_24h
                            const billion = accTradePrice24 / 100000000;
                            const formattedBillion = billion.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
                            const dod = (message.signed_change_rate) * 100;
                            const dodFormatted = dod.toFixed(2);
                            setLastCoinName(extractedCoinName);
                            setLatestTradePrice(tradePrice);
                            setLastTradePrice24(formattedBillion);
                            setDeyOfDey(dodFormatted);
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

        fetchData();
    }, [setLatestTradePrice, setLastCoinName, setLastTradePrice24, setDeyOfDey]);

};

export default UpbitWebSoket;