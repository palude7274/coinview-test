import React, { useState } from 'react';
import { Navbar, Container, Nav, Row, Col, Button } from 'react-bootstrap';
import { CoinDataProvider } from './Context/CoinContext'; 
import CoinList from './Components/CoinList'; 
import './App.css';
import BinanceWebSocket from './Services/BinanceWebSocket'; 
import UpbitWebSocket from './Services/UpbitWebSocket'; 
import CoinNameData from './Services/CoinNameData'; 
import ExchangeRate from './Services/ExchangeRate'; 
import BinanceValidCoins from './Services/BinanceValidCoins';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <CoinDataProvider>
      <CoinNameData />
      <BinanceValidCoins />
      <ExchangeRate />
      <BinanceWebSocket />
      <UpbitWebSocket />
      <div className="App">
        <Navbar className="custom-navbar">
          <Container className='nav-bar'>
            <Navbar.Brand href="#home">버블체크</Navbar.Brand>
            <Nav className="me-auto">
              <Nav.Link href="#bubbleChecked">거품확인</Nav.Link>
              <Nav.Link href="#statisticsIndicators">통계/지표</Nav.Link>
              <Nav.Link href="#bubbleAnalyze">거품분석</Nav.Link>
            </Nav>
          </Container>
        </Navbar>
        <Container>
          <Row>
            <Col className='sideContainer' style={{ background: 'black'}}>
              <Container className="fixedContainer">
                <Row className='sideBanner' style={{ height: '100vh' }}>
                  <Col>왼쪽배너</Col>
                </Row>
              </Container>
            </Col>
            <Col className='centerInfo' style={{ background: 'black', paddingBottom: '0px'}} xs={8}>
              <Container className="fixedContainer" style={{ background: 'black' }}>
                <Row className='colGlobal center4Info'>
                  <Col style={{ margin: '0 5px 0 0' }}>Inner 1</Col>
                  <Col style={{ margin: '0 5px' }}>Inner 2</Col>
                  <Col style={{ margin: '0 5px' }}>Inner 3</Col>
                  <Col style={{ margin: '0 0 0 5px' }}>Inner 4</Col>
                </Row>
              </Container>
              <Container className='topBanner'>
                <Row className='colGlobal banner'>
                  <Col>상단배너</Col>
                </Row>
              </Container >
              <CoinList isChatOpen={isChatOpen}/>
              <Container className='bottomBanner'>
                <Row className='colGlobal banner'>
                  <Col>하단배너</Col>
                </Row>
              </Container>
            </Col>
            <Col className='sideContainer' style={{ background: 'black' }}>
              <Container className="fixedContainer">
                <Row className='sideBanner' style={{ height: '100vh' }}>
                  <Col>오른쪽배너</Col>
                </Row>
              </Container>
            </Col>
          </Row>
          <Row className='footBanner'>
            <Col>FootBanner</Col>
          </Row>
        </Container>
        <div className={`chat-window ${isChatOpen ? 'open' : ''}`}>
          <span>채팅창</span>
          <Button onClick={() => setIsChatOpen(false)} className="close-chat-btn">X</Button>
        </div>
        <Button onClick={() => setIsChatOpen(true)} className="open-chat-btn">채팅창</Button>
        <div style={{ background: 'grey' }}>
          <p style={{ marginBottom: '0' }}>All content © Cryprice. 2024. All rights reserved. contact : roomescape5519@gmail.com</p>
        </div>
      </div>
    </CoinDataProvider>
  );
}

export default App;
