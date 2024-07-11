import React, { createContext, useState, useContext } from 'react';

const CoinContext = createContext();

export const CoinDataProvider = ({ children }) => {
    const [coinNameData, setCoinNameData] = useState([]);
    const [validBinanceCoins, setValidBinanceCoins] = useState([]);
    const [binanceRealtimeData, setBinanceRealtimeData] = useState({});
    const [upbitRealtimeData, setUpbitRealtimeData] = useState({});
    const [exchangeKRW, setExchangeKRW] = useState(null);

    return (
        <CoinContext.Provider value={{
            coinNameData,
            setCoinNameData,
            validBinanceCoins,
            setValidBinanceCoins,
            exchangeKRW,
            setExchangeKRW,
            binanceRealtimeData,
            setBinanceRealtimeData,
            upbitRealtimeData,
            setUpbitRealtimeData

        }}>
            {children}
        </CoinContext.Provider>
    );
};

export const useCoinData = () => {
    const context = useContext(CoinContext);
    if (context === undefined) {
        throw new Error('useCoinData must be used within a CoinDataProvider');
    }
    return context;
};