import { useEffect } from 'react';
import axios from 'axios';
import { useCoinData } from '../Context/CoinContext';

const BinanceValidCoins = () => {
    const { coinNameData, setValidBinanceCoins } = useCoinData();

    useEffect(() => {
        const fetchValidCoins = async () => {
            try {
                const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
                const binanceSymbols = response.data.symbols
                    .filter(symbol => symbol.quoteAsset === 'USDT')
                    .map(symbol => symbol.baseAsset);

                const validCoins = coinNameData.filter(coin =>
                    binanceSymbols.includes(coin.toUpperCase())
                );
                setValidBinanceCoins(validCoins);
            } catch (error) {
                console.error("Error fetchsing valid coins:", error);
            }
        };

        fetchValidCoins();
    }, [coinNameData, setValidBinanceCoins]);

    return null;
};

export default BinanceValidCoins;