import { useEffect, useRef, useCallback, useState } from "react";
import { useCoinData } from '../Context/CoinContext';

const UpbitWebSocket = () => {
    const { coinNameData, setUpbitRealtimeData, favorites, viewMode } = useCoinData();
    const [copyFavorites, setCopyFavorites] = useState([]);
    const tempDataRef = useRef({});
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const favoritesModeTimeoutRef = useRef(null);
    const currentModeRef = useRef('favorites');
    const currentCoinsRef = useRef([]);

    const getSubscribedCoins = useCallback(() => {
        return currentModeRef.current === 'all' ? coinNameData : copyFavorites;
    }, [coinNameData, copyFavorites]);

    const areArraysEqual = (a, b) => {
        if (a.length !== b.length) return false;
        return a.every((item, index) => item === b[index]);
    };

    const connect = useCallback((coins) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            if (areArraysEqual(coins, currentCoinsRef.current)) {
                console.log("업비트 웹소켓 재연결 X");
                return wsRef.current;
            }
            console.log("업비트 웹소켓 재연결 0");
            const codes = coins.map(coin => `KRW-${coin}`);
            const subscribeMsg = JSON.stringify([
                { ticket: "UNIQUE_TICKET_ID" },
                { type: "ticker", codes: codes }
            ]);
            wsRef.current.send(subscribeMsg);
            currentCoinsRef.current = coins;
            return wsRef.current;
        }

        const ws = new WebSocket(`wss://api.upbit.com/websocket/v1`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connected");
            const codes = coins.map(coin => `KRW-${coin}`);
            const subscribeMsg = JSON.stringify([
                { ticket: "UNIQUE_TICKET_ID" },
                { type: "ticker", codes: codes }
            ]);
            ws.send(subscribeMsg);
            currentCoinsRef.current = coins;
        };

        ws.onmessage = (event) => {
            if (event.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = function () {
                    try {
                        const message = JSON.parse(reader.result);

                        if (message.status === "UP") {
                            return;
                        }

                        if (message.error) {
                            console.error("Server error:", message.error);
                            if (message.error.name === "WRONG_FORMAT") {
                                console.log("Attempting to reconnect with modified subscription...");
                                ws.close();
                                setTimeout(() => connect(getSubscribedCoins()), 5000);
                            }
                            return;
                        }

                        if (message.type === "ticker" && message.code && message.trade_price && message.acc_trade_price_24h && message.signed_change_rate !== undefined) {
                            const coinName = message.code.replace("KRW-", "");
                            const upbitPrice = message.trade_price;
                            const accTradePrice24 = message.acc_trade_price_24h;
                            const billion = accTradePrice24 / 100000000;
                            const formattedBillion = billion.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
                            const dod = (message.signed_change_rate) * 100;
                            const dodFormatted = dod.toFixed(2);

                            tempDataRef.current[coinName] = {
                                upbitPrice: upbitPrice,
                                accTradePrice24: formattedBillion,
                                dayOverDay: dodFormatted
                            };
                        } else {
                            console.log("Received unexpected message format:", JSON.stringify(message, null, 2));
                        }
                    } catch (error) {
                        console.error("Error parsing Blob data:", error, "Raw data:", reader.result);
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

        ws.onclose = (event) => {
            console.log("WebSocket closed with code:", event.code);
            reconnectTimeoutRef.current = setTimeout(() => connect(getSubscribedCoins()), 5000);
        };

        return ws;
    }, [getSubscribedCoins]);

    useEffect(() => {
        if (viewMode === 'favorites' && currentModeRef.current === 'all') {
            clearTimeout(favoritesModeTimeoutRef.current);
            favoritesModeTimeoutRef.current = setTimeout(() => {
                if (currentModeRef.current === 'favorites') {
                    console.log("업비트 - 즐겨찾기 코인 웹소켓 재연결 시도");
                    setCopyFavorites(favorites);
                    connect(favorites);
                }
            }, 5 * 60 * 1000);
        } else if (viewMode === 'all') {
            clearTimeout(favoritesModeTimeoutRef.current);
            if (currentModeRef.current !== 'all') {
                console.log("업비트 - 전체 코인으로 웹소켓 연결 시도");
                connect(coinNameData);
                currentModeRef.current = 'all';
            }
        }
        currentModeRef.current = viewMode;
    }, [viewMode, favorites, coinNameData, copyFavorites, connect]);

    useEffect(() => {
        if (favorites.length > 0 && copyFavorites.length === 0) {
            setTimeout(() => {
                setCopyFavorites(favorites);
                console.log("업비트 - 즐겨찾기 코인 복사");
            }, 300);
        }
    }, [favorites, copyFavorites]);

    useEffect(() => {
        if (copyFavorites.length > 0 && !wsRef.current) {
            console.log("업비트 - 업소켓 연결 시도");
            const ws = connect(copyFavorites);
            currentModeRef.current = 'favorites';

            const updateData = () => {
                setUpbitRealtimeData(prevData => ({
                    ...prevData,
                    ...tempDataRef.current
                }));
            };

            const updateInitialData = () => {
                if (Object.keys(tempDataRef.current).length > 0) {
                    setTimeout(() => {
                        updateData();
                    }, 900);
                } else {
                    setTimeout(updateInitialData, 100);
                }
            };

            ws.onopen = () => {
                console.log("WebSocket connected");
                const codes = copyFavorites.map(coin => `KRW-${coin}`);
                const subscribeMsg = JSON.stringify([
                    { ticket: "UNIQUE_TICKET_ID" },
                    { type: "ticker", codes: codes }
                ]);
                ws.send(subscribeMsg);
                currentCoinsRef.current = copyFavorites;
                
                updateInitialData();
            };

            const intervalId = setInterval(updateData, 3000);

            return () => {
                clearInterval(intervalId);
                clearTimeout(reconnectTimeoutRef.current);
                clearTimeout(favoritesModeTimeoutRef.current);
                if (wsRef.current) {
                    wsRef.current.close();
                }
            };
        }
    }, [copyFavorites, setUpbitRealtimeData, connect]);

    return null;
};

export default UpbitWebSocket;