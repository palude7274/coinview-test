import React, { useState } from 'react';
import { Navbar, Container, Nav, Row, Col, Table } from 'react-bootstrap';
import UpbitWebSoket from './WebSoket/UpbitWebSoket';
import BinanceWebSocket from './WebSoket/BinanceWebSoket';
import './App.css';


function App() {
  const [latestTradePrice, setLatestTradePrice] = useState(null);
  const [lastCoinName, setLastCoinName] = useState(null);
  const [lastTradePrice24, setLastTradePrice24] = useState(null);
  const [deyOfDey, setDeyOfDey] = useState(null);
  const [lastBinancePrice, setLastBinancePrice] = useState(null);

  return (
    <div className="App">
      <Navbar bg="dark" variant="dark">
        <Container className='nav-bar'>
          <Navbar.Brand href="#home">버블체크</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="#bubbleChecked">거품확인</Nav.Link>
            <Nav.Link href="#statisticsIndicators">통계/지표</Nav.Link>
            <Nav.Link href="#bubbleAnalyze">거품분석</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <Container fluid>
        <Row>
          <Col className='sideContainer' style={{ background: 'black' }} xs={2}>
            <Container className="fixedContainer">
              <Row className='sideInpo' style={{ height: '250px' }}>
                <Col>정보란1</Col>
              </Row>
              <Row className='sideBanner' style={{ height: 'calc(100vh - 250px)' }}>
                <Col>정보란 또는 광고</Col>
              </Row>
            </Container>
          </Col>
          <Col className="centerContainer" style={{ background: 'black', paddingBottom: '0px' }} xs={7}>
            <Container className="fixedContainer" style={{ background: 'black' }}>
              <Row className='colGlobal center4Inpo'>
                <Col>Inner 1</Col>
                <Col>Inner 2</Col>
                <Col>Inner 3</Col>
                <Col>Inner 4</Col>
              </Row>
            </Container>
            <Container style={{ paddingTop: '0' }}>
              <Row className='colGlobal banner'>
                <Col>광고배너</Col>
              </Row>
            </Container>
            <Container>
              <Row className='colGlobal centerInpo'>
                <Col>
                  <Table striped bordered hover variant="dark">
                    <thead>
                      <tr className='table-cell'>
                        <th style={{width: '100px'}}>이름</th>
                        <th>바이낸스 현재가</th>
                        <th>업비트 현재가</th>
                        <th>누적거래량</th>
                        <th>전일대비</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className='table-cell'>
                        <td className='logos'>
                          <div className='logoLeft'>
                            {lastCoinName ? (
                              <img className='logoImg'
                                src={`https://static.upbit.com/logos/${lastCoinName}.png`}
                                alt={`${lastCoinName} logo`}
                                style={{ width: '18px', height: '18px', marginBottom: '7%'}} // 이미지 크기 조절 예시
                              />
                            ) : (
                              ''
                            )}
                          </div>
                          <div className='logoRight'>
                            <span>{lastCoinName || ''}</span>
                          </div>
                        </td>
                        <td>{lastBinancePrice !== null && !isNaN(lastBinancePrice) ? `${lastBinancePrice}달러` : '달러'}</td>
                        <td>{latestTradePrice !== null ? `${latestTradePrice}원` : ''}</td>
                        <td>{lastTradePrice24 !== null ? `${lastTradePrice24}억` : ''}</td>
                        <td>{deyOfDey !== null ? `${deyOfDey}%` : ''}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Container>
            <Container>
              <Row className='colGlobal banner'>
                <Col>광고배너</Col>
              </Row>
            </Container>
          </Col>
          <Col className='sideContainer' style={{ background: 'black' }}>
            <Container className="chatbox">
              <Row>
                <Col style={{ height: '680px' }}>채팅창</Col>
              </Row>
            </Container>
          </Col>
        </Row>
      </Container>
      <Container className='footBanner' fluid style={{ background: 'black' }}>
        <Row>
          <Col>FootBanner</Col>
        </Row>
      </Container>
      <div style={{ background: 'grey'}}>
        <p style={{ marginBottom: '0'}}>All content © Cryprice. 2024. All rights reserved. contact : roomescape5519@gmail.com</p>
      </div>
    
      <UpbitWebSoket
        setLatestTradePrice={setLatestTradePrice}
        setLastCoinName={setLastCoinName}
        setLastTradePrice24={setLastTradePrice24}
        setDeyOfDey={setDeyOfDey}
      />
      <BinanceWebSocket 
        setLastBinancePrice={setLastBinancePrice}
      />
    </div>
  );
}

export default App;
