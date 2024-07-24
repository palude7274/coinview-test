import { useEffect } from 'react';
import axios from 'axios';
import { useCoinData } from '../Context/CoinContext';

const ExchangeRate = () => {
    const { setExchangeKRW } = useCoinData();

    useEffect(() => {
        const fetchExchangeRate = async (date) => {
            const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/usd.json`;
            
            try {
                const response = await axios.get(url);
                const usdData = response.data.usd;
                const krwValue = usdData.krw;
                setExchangeKRW(krwValue);
            } catch (error) {
                console.error('데이터를 가져오는 중 오류 발생:', error);
                
                // 오늘 날짜로 데이터를 가져오지 못한 경우, 어제 날짜로 재시도
                if (date === getCurrentDate()) {
                    const yesterday = getYesterday();
                    fetchExchangeRate(yesterday);
                }
            }
        };

        const getCurrentDate = () => {
            return new Date().toISOString().slice(0, 10);
        };

        const getYesterday = () => {
            const date = new Date();
            date.setDate(date.getDate() - 1);
            return date.toISOString().slice(0, 10);
        };

        fetchExchangeRate(getCurrentDate());
    }, [setExchangeKRW]);
};

export default ExchangeRate;