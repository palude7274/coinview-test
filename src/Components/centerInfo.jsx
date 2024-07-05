import React, { useEffect, useState } from "react";
import UpbitWebSocket from '../WebSocket/UpbitWebSocket';
import BinanceWebSocket from '../WebSocket/BinanceWebSocket';
import ExchangeRate from "../WebSocket/ExchangeRate";
import { Container, Row, Col, Table } from 'react-bootstrap';

const CenterInpo = () => {
    const [coinName, setCoinName] = useState(null);
    const [upbitPrice, setUpbitPrice] = useState(null);
    const [binancePrice, setBinancePrice] = useState(null);
    const [accTradePrice24, setAccTradePrice24] = useState(null);
    const [dayOverDay, setDayOverDay] = useState(null);
    const [exchangeKRW, setExchangeKRW] = useState(null);
    const [kimchiPremium, setKimchiPremium] = useState(null);
    const [kimchiDefference, setKimchiDefference] = useState(null);

    useEffect(()=>{
        const binanceKRW = (binancePrice*exchangeKRW);
        const dodFormatted = binanceKRW.toFixed(2);
        const kimchiPremium = ((upbitPrice/dodFormatted) -1 ) * 100;
        const difference=(upbitPrice-dodFormatted);
        setKimchiDefference(difference.toLocaleString('ko-kr', { maximumFractionDigits: 0 }));
        setKimchiPremium(kimchiPremium.toFixed(2));

    }, [upbitPrice, binancePrice, exchangeKRW]);

    return (
        <Container>
            <Row className='colGlobal centerInpo'>
                <Col>
                    <Table striped bordered hover variant="dark">
                        <thead>
                            <tr className='table-cell'>
                                <th style={{ width: '70px' }}>코인</th>
                                <th style={{ width: '150px' }}>바이낸스($)</th>
                                <th style={{ width: '150px' }}>업비트(₩)</th>
                                <th style={{ width: '100px' }}>거래량(억)</th>
                                <th style={{ width: '100px' }}>전일대비(%)</th>
                                <th style={{ width: '200px' }}>김프(₩)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className='table-cell'>
                                <td className='logos'>
                                    <div className='logoLeft'>
                                        {coinName ? (
                                            <img className='logoImg'
                                                src={`https://static.upbit.com/logos/${coinName}.png`}
                                                alt={`${coinName} logo`}
                                                style={{ width: '18px', height: '18px', marginBottom: '20%' }} // 이미지 크기 조절 예시
                                            />
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                    <div className='logoRight'>
                                        <span>{coinName || ''}</span>
                                    </div>
                                </td>
                                <td>{binancePrice !== null && !isNaN(binancePrice) ? `${binancePrice.toLocaleString('ko-kr')}` : ''}</td>
                                <td>{upbitPrice !== null ? `${upbitPrice.toLocaleString('ko-kr', { maximumFractionDigits: 0 })}` : ''}</td>
                                <td>{accTradePrice24 !== null ? `${accTradePrice24}억` : '억'}</td>
                                <td>{dayOverDay !== null ? `${dayOverDay}%` : ''}</td>
                                <td>{kimchiDefference !== null ? `${kimchiDefference}` : ''}{kimchiPremium !== null && !isNaN(kimchiPremium) && isFinite(kimchiPremium) ? ` (${kimchiPremium}%)` : '%'}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <UpbitWebSocket
                setCoinName={setCoinName}
                setUpbitPrice={setUpbitPrice}
                setAccTradePrice24={setAccTradePrice24}
                setDayOverDay={setDayOverDay} />
            <BinanceWebSocket
                setBinancePrice={setBinancePrice} />
            <ExchangeRate 
                setExchangeKRW={setExchangeKRW}/>
        </Container>
    );
};

export default CenterInpo;
