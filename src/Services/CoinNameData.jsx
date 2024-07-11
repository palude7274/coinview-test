import { useEffect } from 'react';
import axios from 'axios';
import { useCoinData } from '../Context/CoinContext';

const CoinNameData = () => {
    const { setCoinNameData } = useCoinData();

    useEffect(() => {
        const url = `https://api.upbit.com/v1/market/all`;

        axios.get(url)
            .then(response => {
                const coinData = response.data;
                const krwMarkets = coinData.filter(coin => coin.market.includes('KRW-')).map(coin => coin.market.replace('KRW-', ''));
                setCoinNameData(krwMarkets);
            })

            .catch(error => {
                console.error('데이터를 가져오는 중 오류 발생:', error);
            });
    }, [setCoinNameData]);
};

export default CoinNameData;
