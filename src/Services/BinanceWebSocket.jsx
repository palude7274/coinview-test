import { useEffect, useRef, useCallback, useState } from "react";
import { useCoinData } from '../Context/CoinContext';

const BinanceWebSocket = () => {
    const { validBinanceCoins, setBinanceRealtimeData, favorites, viewMode } = useCoinData();
    const [copyFavorites, setCopyFavorites] = useState([]);
    const tempDataRef = useRef({});
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const favoritesModeTimeoutRef = useRef(null);
    const currentModeRef = useRef('all');
    const currentCoinsRef = useRef([]);

    const getSubscribedCoins = useCallback(() => {
        return currentModeRef.current === 'all' ? validBinanceCoins : copyFavorites;
    }, [validBinanceCoins, copyFavorites]);

    const areArraysEqual = (a, b) => {
        if (a.length !== b.length) return false;
        return a.every((item, index) => item === b[index]);
    };

    const connect = useCallback((coins) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            if (areArraysEqual(coins, currentCoinsRef.current)) {
                console.log("바이낸스 업소켓 재연결 X");
                return wsRef.current;
            }
            console.log("바이낸스 업소켓 재연결 0");
            const unsubscribeMsg = {
                method: "UNSUBSCRIBE",
                params: currentCoinsRef.current.map(coin => `${coin.toLowerCase()}usdt@ticker`),
                id: 2
            };
            wsRef.current.send(JSON.stringify(unsubscribeMsg));

            const subscribeMsg = {
                method: "SUBSCRIBE",
                params: coins.map(coin => `${coin.toLowerCase()}usdt@ticker`),
                id: 1
            };
            wsRef.current.send(JSON.stringify(subscribeMsg));
            currentCoinsRef.current = coins;
            return wsRef.current;
        }

        const ws = new WebSocket(`wss://stream.binance.com:9443/ws`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("Binance WebSocket connected");
            const subscribeMsg = {
                method: "SUBSCRIBE",
                params: coins.map(coin => `${coin.toLowerCase()}usdt@ticker`),
                id: 1
            };
            ws.send(JSON.stringify(subscribeMsg));
            currentCoinsRef.current = coins;
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

                    tempDataRef.current[coinName] = {
                        binancePrice: binancePrice
                    };
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
            reconnectTimeoutRef.current = setTimeout(() => connect(getSubscribedCoins()), 5000);
        };

        return ws;
    }, [getSubscribedCoins]);

    useEffect(() => {
        if (viewMode === 'favorites' && currentModeRef.current === 'all') {
            clearTimeout(favoritesModeTimeoutRef.current);
            favoritesModeTimeoutRef.current = setTimeout(() => {
                if (currentModeRef.current === 'favorites') {
                    console.log("바이낸스 - 즐겨찾기 코인 업소켓 재연결 시도");
                    setCopyFavorites(favorites);
                    connect(favorites);
                }
            }, 5 * 60 * 1000);
        } else if (viewMode === 'all') {
            clearTimeout(favoritesModeTimeoutRef.current);
            if (currentModeRef.current !== 'all') {
                console.log("바이낸스 - 전체 코인으로 업소켓 연결 시도");
                connect(validBinanceCoins);
                currentModeRef.current = 'all';
            }
        }
        currentModeRef.current = viewMode;
    }, [viewMode, favorites, validBinanceCoins, copyFavorites, connect]);

    useEffect(() => {
        if (favorites.length > 0 && copyFavorites.length === 0) {
            setTimeout(() => {
                setCopyFavorites(favorites);
                console.log("바이낸스 - 즐겨찾기 코인 복사");
            }, 400);
        }
    }, [favorites, copyFavorites]);

    useEffect(() => {
        if (copyFavorites.length > 0 && !wsRef.current) {
            console.log("바이낸스 - 업소켓 연결 시도");
            const ws = connect(copyFavorites);
            currentModeRef.current = 'favorites';

            // 데이터 업데이트 함수
            const updateData = () => {
                setBinanceRealtimeData(prevData => ({
                    ...prevData,
                    ...tempDataRef.current
                }));
            };

            // 초기 데이터를 즉시 업데이트하는 함수
            const updateInitialData = () => {
                if (Object.keys(tempDataRef.current).length > 0) {
                    setTimeout(() => {
                        updateData();
                    }, 700);
                } else {
                    setTimeout(updateInitialData, 100);  // 데이터가 없으면 100ms 후 다시 시도
                }
            };

            // 웹소켓 연결 성공 시 즉시 데이터 업데이트
            ws.onopen = () => {
                console.log("Binance WebSocket connected");
                const subscribeMsg = {
                    method: "SUBSCRIBE",
                    params: copyFavorites.map(coin => `${coin.toLowerCase()}usdt@ticker`),
                    id: 1
                };
                ws.send(JSON.stringify(subscribeMsg));
                currentCoinsRef.current = copyFavorites;

                // 연결 직후 즉시 데이터 업데이트
                updateInitialData();
            };

            // 3초마다 주기적으로 업데이트
            const intervalId = setInterval(updateData, 3000);

            return () => {
                clearInterval(intervalId);
                clearTimeout(reconnectTimeoutRef.current);
                clearTimeout(favoritesModeTimeoutRef.current);
                ws.close();
            };
        }
    }, [copyFavorites, setBinanceRealtimeData, connect]);

    return null;
};

export default BinanceWebSocket;