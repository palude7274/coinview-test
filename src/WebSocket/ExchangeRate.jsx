import { useEffect } from 'react';
import axios from 'axios';

const ExchangeRate = ({setExchangeKRW}) => {
    useEffect(() => {
        const currentDate = new Date().toISOString().slice(0, 10);
        const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${currentDate}/v1/currencies/usd.json`;

        axios.get(url)
            .then(response => {
                const usdData = response.data.usd;
                const krwValue = usdData.krw;
                setExchangeKRW(krwValue);
            })
            .catch(error => {
                console.error('데이터를 가져오는 중 오류 발생:', error);
            });
    }, [setExchangeKRW]);
};

export default ExchangeRate;
