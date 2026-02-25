/* 공통 변수 및 초기화 */
let currentPrice = 0;      // 현재 입찰가
let timeLeft = 60;         // 남은 시간
let timerInterval = null;  // 타이머 제어용

/* 작품 선택 및 경매 시작 */
function selectArt(title, artist, price, estimate) {
    // 1. 이벤트 타겟으로부터 이미지 경로 추출
    const clickedCard = window.event.currentTarget;
    const selectedImgSrc = clickedCard.querySelector('img').src;

    // 2. 화면 섹션 전환 (카탈로그 숨기고 경매장 표시)
    document.getElementById('catalog-section').classList.add('hidden');
    document.getElementById('auction-room').classList.remove('hidden');

    // 3. 작품 상세 정보 및 이미지 반영
    document.getElementById('art-title').innerText = title;
    document.getElementById('art-artist').innerText = artist;
    document.getElementById('auction-art-img').src = selectedImgSrc;

    // 4. 경매 데이터 초기화
    currentPrice = Number(price);
    timeLeft = 60;

    // 5. UI 초기화
    document.getElementById('seconds').innerText = timeLeft;
    document.getElementById('bid-history').innerHTML = "";
    
    // 입찰 버튼 상태 복구 (비활성화 해제)
    const bidButtons = document.querySelectorAll('.btn-bid');
    bidButtons.forEach(button => {
        button.disabled = false;
    });

    // 6. 페이지 상단으로 스크롤 이동 및 타이머 가동
    window.scrollTo(0, 0);
    updateUI();
    startTimer();
}

/* 타이머 로직 */
function startTimer() {
    // 기존 타이머가 있다면 중지
    if (timerInterval) clearInterval(timerInterval);

    const secondsDisplay = document.getElementById('seconds');

    timerInterval = setInterval(() => {
        timeLeft--;
        
        if (secondsDisplay) {
            secondsDisplay.textContent = timeLeft;
        }

        // 시간 종료 시
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endAuction();
        }
    }, 1000);
}

/* 입찰 로직 */
function placeBid(increment) {
    if (timeLeft <= 0) return;

    // 금액 합산
    currentPrice += increment;

    // 입찰 기록(Bid History) 추가
    const historyList = document.getElementById('bid-history');
    if (historyList) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="history-user">Collector</span>
            <span class="history-price" style="float: right;">₩${currentPrice.toLocaleString()}</span>
        `;
        // 최신 입찰 건이 위로 오도록 prepend 사용
        historyList.prepend(li);
    }

    updateUI();
}

/* UI 업데이트 */
function updateUI() {
    const priceDisplay = document.getElementById('current-price');
    if (priceDisplay) {
        priceDisplay.innerText = `₩${currentPrice.toLocaleString()}`;
    }
}

/* 경매 종료 및 결과 표시 (통합 수정본) */
function endAuction() {
    // 1. 타이머 및 모든 인터랙션 정지
    if (timerInterval) clearInterval(timerInterval);
    const bidButtons = document.querySelectorAll('.btn-bid');
    bidButtons.forEach(button => button.disabled = true);

    // 2. 현재 시각 및 데이터 추출
    const now = new Date();
    const timeString = `${now.getHours()}시 ${now.getMinutes()}분 ${now.getSeconds()}초`;
    const finalPrice = currentPrice.toLocaleString();
    const historyList = document.getElementById('bid-history');
    const totalBids = historyList ? historyList.children.length : 0;

    // 3. 커스텀 알림창(custom-alert)만 표시 (중복 방지)
    const customAlert = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');
    
    if (customAlert && alertMessage) {
        if (totalBids > 0) {
            alertMessage.innerHTML = `
                <div style="margin-bottom: 10px; font-size: 1.1rem; color: #fff;">정해진 경매 시간이 종료되었습니다.</div>
                <div style="border-top: 1px solid #333; margin-top: 15px; padding-top: 15px; text-align: left; font-size: 0.85rem; color: #bbb;">
                    • 낙찰 시각: <span style="color:#fff;">${timeString}</span><br>
                    • 최종 낙찰가: <span style="color:#c5a059; font-weight:bold;">₩${finalPrice}</span>
                </div>
                <div style="margin-top: 15px; font-weight: bold; color: #c5a059;">성공적으로 낙찰되었습니다!</div>
            `;
        } else {
            alertMessage.innerHTML = `
                <div style="margin-bottom: 10px; font-size: 1.1rem; color: #fff;">경매 시간이 종료되었습니다.</div>
                <div style="margin-top: 10px; color: #888;">입찰 기록이 없어 유찰되었습니다.</div>
            `;
        }
        customAlert.classList.remove('hidden');
    }

    // 4. 타이머 UI 0초로 고정
    const secondsDisplay = document.getElementById('seconds');
    if (secondsDisplay) {
        secondsDisplay.innerText = "0";
    }
}

/* 초기화 (Back to Collection) */
function resetGallery() {
    if (timerInterval) clearInterval(timerInterval);
    
    // 페이지 새로고침을 통해 모든 상태를 처음으로 되돌림
    location.reload();
}
