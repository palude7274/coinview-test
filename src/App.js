import React from 'react';
import { Navbar, Container, Nav, Row, Col } from 'react-bootstrap';
import { CoinDataProvider } from './Context/CoinContext'; // src/Context/CoinContext.jsx 경로
import CoinList from './Components/CoinList'; // src/Components/CoinList.jsx 경로
import './App.css';
import BinanceWebSocket from './Services/BinanceWebSocket'; // src/Services/BinanceWebSocket.jsx 경로
import UpbitWebSocket from './Services/UpbitWebSocket'; // src/Services/UpbitWebSocket.jsx 경로
import CoinNameData from './Services/CoinNameData'; // src/Services/CoinNameData.jsx 경로
import ExchangeRate from './Services/ExchangeRate'; // src/Services/ExchangeRate.jsx 경로

function App() {
  return (
    <CoinDataProvider>
      <CoinNameData />
      <ExchangeRate />
      <BinanceWebSocket />
      <UpbitWebSocket />
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
              <CoinList />
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
        <div style={{ background: 'grey' }}>
          <p style={{ marginBottom: '0' }}>All content © Cryprice. 2024. All rights reserved. contact : roomescape5519@gmail.com</p>
        </div>
      </div>
    </CoinDataProvider>
  );
}

export default App;
