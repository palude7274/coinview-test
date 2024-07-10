import React, { useRef, useEffect } from "react";
import { Container, Row, Col, Table } from 'react-bootstrap';
import { useCoinData } from '../Context/CoinContext'; 

const CoinList = () => {
    const { coinNameData, exchangeKRW, binanceRealtimeData, upbitRealtimeData } = useCoinData();
    const prevDataRef = useRef({}); // 이전 데이터를 저장하기 위한 ref
    const cellRefs = useRef({}); // 각 셀에 대한 ref를 저장하기 위한 ref

    // 각 셀에 대한 ref를 생성하거나 가져오는 함수
    const getCellRef = (coinName, field) => {
        if (!cellRefs.current[coinName]) {
            cellRefs.current[coinName] = {};
        }
        if (!cellRefs.current[coinName][field]) {
            cellRefs.current[coinName][field] = React.createRef();
        }
        return cellRefs.current[coinName][field];
    };

    // 배경색 변경 애니메이션을 적용하는 함수
    const flashAnimation = (element, isIncrease) => {
        // 증가했을 때는 옅은 파란색, 감소했을 때는 옅은 빨간색 사용
        const color = isIncrease ? '#e6f3ff' : '#ffe6e6';
        element.style.transition = 'background-color 0.5s';
        element.style.backgroundColor = color;
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 500);
    };

    useEffect(() => {
        coinNameData.forEach((coinName) => {
            const fields = ['binancePrice', 'upbitPrice', 'dayOverDay', 'accTradePrice24', 'kimchi'];
            fields.forEach((field) => {
                let currentValue, prevValue;
                
                // 각 필드에 대한 현재 값 계산
                if (field === 'kimchi') {
                    const currentUpbitPrice = upbitRealtimeData[coinName]?.upbitPrice || 0;
                    const currentBinancePrice = binanceRealtimeData[coinName]?.binancePrice || 0;
                    currentValue = ((currentUpbitPrice - currentBinancePrice * exchangeKRW) / (currentBinancePrice * exchangeKRW)) * 100;
                } else if (field === 'binancePrice') {
                    currentValue = binanceRealtimeData[coinName]?.[field];
                } else {
                    currentValue = upbitRealtimeData[coinName]?.[field];
                }

                prevValue = prevDataRef.current[coinName]?.[field];
                
                // 이전 값과 현재 값이 다를 경우 애니메이션 적용
                if (prevValue !== undefined && currentValue !== prevValue) {
                    const cellRef = getCellRef(coinName, field);
                    if (cellRef.current) {
                        const isIncrease = currentValue > prevValue;
                        flashAnimation(cellRef.current, isIncrease);
                    }
                }

                // 현재 값을 이전 값으로 업데이트
                if (!prevDataRef.current[coinName]) {
                    prevDataRef.current[coinName] = {};
                }
                prevDataRef.current[coinName][field] = currentValue;
            });
        });
    }, [coinNameData, binanceRealtimeData, upbitRealtimeData, exchangeKRW]);

    return (
        <Container>
            <Row>
                <Col>
                    <Table striped bordered hover>
                        <thead>
                            <tr className='table-cell'>
                                <th style={{ width: '70px' }}>코인</th>
                                <th style={{ width: '150px' }}>바이낸스($)</th>
                                <th style={{ width: '150px' }}>업비트(₩)</th>
                                <th style={{ width: '100px' }}>전일대비(%)</th>
                                <th style={{ width: '100px' }}>거래량(억)</th>
                                <th style={{ width: '200px' }}>김프(%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coinNameData.map((coinName) => {
                                const binanceData = binanceRealtimeData[coinName] || {};
                                const upbitData = upbitRealtimeData[coinName] || {};
                                const binancePrice = binanceData.binancePrice || '-';
                                const upbitPrice = upbitData.upbitPrice || '-';
                                const dayOverDay = upbitData.dayOverDay || '-';
                                const accTradePrice24 = upbitData.accTradePrice24 || '-';
                                const kimchi = (upbitPrice !== '-' && binancePrice !== '-')
                                    ? ((upbitPrice - binancePrice * exchangeKRW) / (binancePrice * exchangeKRW) * 100).toFixed(2)
                                    : '-';

                                return (
                                    <tr className='table-cell' key={coinName}>
                                        <td className='logos'>
                                            <div className='logoLeft'>
                                                {coinName ? (
                                                    <img className='logoImg'
                                                        src={`https://static.upbit.com/logos/${coinName}.png`}
                                                        alt={`${coinName} logo`}
                                                        style={{ width: '18px', height: '18px', marginBottom: '20%' }}
                                                    />
                                                ) : (
                                                    '-'
                                                )}
                                            </div>
                                            <div className='logoRight'>
                                                <span>{coinName}</span>
                                            </div>
                                        </td>
                                        {/* 각 셀에 ref 추가 */}
                                        <td ref={getCellRef(coinName, 'binancePrice')}>{binancePrice}</td>
                                        <td ref={getCellRef(coinName, 'upbitPrice')}>{upbitPrice}</td>
                                        <td ref={getCellRef(coinName, 'dayOverDay')}>{dayOverDay}%</td>
                                        <td ref={getCellRef(coinName, 'accTradePrice24')}>{accTradePrice24}</td>
                                        <td ref={getCellRef(coinName, 'kimchi')}>{kimchi}%</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
};

export default CoinList;