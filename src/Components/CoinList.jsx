import React, { useRef, useEffect, useState, useMemo } from "react";
import { Container, Row, Col } from 'react-bootstrap';
import { useCoinData } from '../Context/CoinContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

const CoinList = ({ isChatOpen }) => {
    const { coinNameData, exchangeKRW, binanceRealtimeData, upbitRealtimeData } = useCoinData();
    const prevDataRef = useRef({}); // 이전 데이터를 저장하기 위한 ref
    const cellRefs = useRef({}); // 각 셀에 대한 ref를 저장하기 위한 ref
    // 즐겨찾기 눌린 코인 저장
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('favorites');
        return saved ? JSON.parse(saved) : ['BTC', 'ETH', 'BCH', 'XRP', 'DOGE', 'SHIB', 'ADA', 'TRX'];
    });
    const [viewMode, setViewMode] = useState('favorites'); // 전체 코인, 즐겨찾기 상태
    const [searchTerm, setSearchTerm] = useState(''); // 서치

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
        const color = isIncrease ? '#1b1a8977' : 'rgba(255, 0, 0, 0.2)';
        element.style.transition = 'background-color 0.5s';
        element.style.backgroundColor = color;
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 500);
    };

    // 숫자에 천 단위 구분자를 추가하는 함수 (소수점 유지)
    const formatNumber = (number) => {
        if (number === '-' || number === undefined) return '-';
        const parts = number.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join('.');
    };

    // 김프 계산 함수
    const calculateKimchi = (upbitPrice, binancePrice) => {
        if (!upbitPrice || !binancePrice || !exchangeKRW || binancePrice === 0) {
            return '-';
        }
        const kimchi = ((upbitPrice - binancePrice * exchangeKRW) / (binancePrice * exchangeKRW)) * 100;
        return isNaN(kimchi) ? '-' : kimchi.toFixed(2);
    };

    // 정렬된 코인 데이터 계산 (검색어와 즐겨찾기 필터링 포함)
    const filteredAndSortedCoinData = useMemo(() => {
        let filtered = [...coinNameData];
        if (searchTerm) {
            filtered = filtered.filter(coin => coin.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (viewMode === 'favorites') {
            filtered = filtered.filter(coin => favorites.includes(coin));
        }
        return filtered.sort((a, b) => {
            const priceA = upbitRealtimeData[a]?.upbitPrice || 0;
            const priceB = upbitRealtimeData[b]?.upbitPrice || 0;
            return priceB - priceA;
        });
    }, [coinNameData, upbitRealtimeData, favorites, viewMode, searchTerm]);

    // 즐겨찾기 토글 함수
    const toggleFavorite = (coin) => {
        setFavorites(prev => {
            const newFavorites = prev.includes(coin)
                ? prev.filter(c => c !== coin)
                : [...prev, coin];
            localStorage.setItem('favorites', JSON.stringify(newFavorites));
            return newFavorites;
        });
    };

    useEffect(() => {
        filteredAndSortedCoinData.forEach((coinName) => {
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

                // 각 셀의 Ref 가져오기
                const cellRef = getCellRef(coinName, field);

                // 전일대비와 김프 색상 클래스 추가
                if (field === 'dayOverDay') {
                    if (currentValue > 0) {
                        cellRef.current?.classList.add('blue-text');
                    } else if (currentValue < 0) {
                        cellRef.current?.classList.add('red-text');
                    }
                } else if (field === 'kimchi') {
                    if (currentValue > 0) {
                        cellRef.current?.classList.add('blue-text');
                    } else if (currentValue < 0) {
                        cellRef.current?.classList.add('red-text');
                    }
                }


            });
        });
    }, [filteredAndSortedCoinData, binanceRealtimeData, upbitRealtimeData, exchangeKRW]);

    return (
        <Container className='centerCoinList'>
            <Row className="colGlobal">
                <Col>
                    <table className={`customTable ${isChatOpen ? 'narrow' : ''}`}>
                        <thead>
                            <tr>
                                <th colSpan="6" style={{ padding: 0 }}>
                                    <div style={{ display: 'flex', width: '100%', textAlign: 'center', paddingBottom: '10px' }}>
                                        <span
                                            style={{ flex: 1, cursor: 'pointer', color: viewMode === 'all' ? '#80abd1' : '#e5e5eb' }}
                                            onClick={() => setViewMode('all')}
                                        >
                                            전체 코인
                                        </span>
                                        <span
                                            style={{ flex: 1, cursor: 'pointer', color: viewMode === 'favorites' ? '#80abd1' : '#e5e5eb' }}
                                            onClick={() => setViewMode('favorites')}
                                        >
                                            즐겨 찾기
                                        </span>
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '200px' }}>
                                                <FontAwesomeIcon
                                                    icon={faMagnifyingGlass}
                                                    style={{
                                                        color: 'gray',
                                                        backgroundColor: 'white',
                                                        padding: '5px',
                                                        borderRadius: '5px 0 0 5px'
                                                    }}
                                                />
                                                <input
                                                    style={{
                                                        flex: 1,
                                                        minWidth: '0',
                                                        paddingLeft: '8px',
                                                        paddingRight: '8px',
                                                        marginRight: '5px',
                                                        border: 'none',
                                                        outline: 'none',
                                                        borderRadius: '0 5px 5px 0',
                                                        textAlign: 'left'
                                                    }}
                                                    placeholder="코인 검색"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </th>
                            </tr>
                            <tr>
                                <th className='wide' style={{width:'10%'}}>코인</th>
                                <th>바이낸스($)</th>
                                <th>업비트(₩)</th>
                                <th>전일대비(%)</th>
                                <th>거래량(억)</th>
                                <th>김프(%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedCoinData.map((coinName) => {
                                const binanceData = binanceRealtimeData[coinName] || {};
                                const upbitData = upbitRealtimeData[coinName] || {};
                                const binancePrice = formatNumber(binanceData.binancePrice);
                                const upbitPrice = formatNumber(upbitData.upbitPrice);
                                const dayOverDay = formatNumber(upbitData.dayOverDay);
                                const accTradePrice24 = upbitData.accTradePrice24 || '-';
                                const kimchi = calculateKimchi(upbitData.upbitPrice, binanceData.binancePrice);

                                return (
                                    <tr key={coinName}>
                                        <td className='logos'>
                                            <div>
                                                <FontAwesomeIcon
                                                    icon={faCheck}
                                                    style={{
                                                        color: favorites.includes(coinName) ? '#80abd1' : 'gray',
                                                        borderBottom : favorites.includes(coinName) ? '2px solid #80abd1' : 'gray',
                                                        cursor: 'pointer' }}
                                                    onClick={() => toggleFavorite(coinName)}
                                                />
                                            </div>
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
                    </table>
                </Col>
            </Row>
        </Container >
    );
};

export default CoinList;