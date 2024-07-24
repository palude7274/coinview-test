import React, { createContext, useState, useContext } from 'react';

const CoinContext = createContext();

export const CoinDataProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('favorites');
        return saved ? JSON.parse(saved) : ['BTC', 'ETH', 'BCH', 'XRP', 'DOGE', 'SHIB', 'ADA', 'TRX'];
    });
    const [viewMode, setViewMode] = useState('favorites');
    const [coinNameData, setCoinNameData] = useState([]);
    const [validBinanceCoins, setValidBinanceCoins] = useState([]);
    const [binanceRealtimeData, setBinanceRealtimeData] = useState({});
    const [upbitRealtimeData, setUpbitRealtimeData] = useState({});
    const [exchangeKRW, setExchangeKRW] = useState(null);

    return (
        <CoinContext.Provider value={{
            favorites,
            setFavorites,
            viewMode,
            setViewMode,
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