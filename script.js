/*  공통 변수 및 초기화 */
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

/*   타이머 로직 */

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

/* [4] 입찰 로직 */

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

/* 경매 종료 및 결과 표시 */

function endAuction() {
    // 1. 결과 모달 표시 및 낙찰 정보 삽입
    const resultModal = document.getElementById('result-modal');
    if (resultModal) {
        resultModal.classList.remove('hidden');
        document.getElementById('winner-info').innerText = "AUCTION CLOSED";
        document.getElementById('final-price-display').innerText = 
            `최종 낙찰가: ₩${currentPrice.toLocaleString()}`;
    }

    // 2. 입찰 버튼 비활성화 (CSS에서 disabled 처리)
    const bidButtons = document.querySelectorAll('.btn-bid');
    bidButtons.forEach(button => {
        button.disabled = true;
    });

    // 3. 타이머 정지
    if (timerInterval) clearInterval(timerInterval);
}

/* 초기화 (Back to Collection) */
function resetGallery() {
    if (timerInterval) clearInterval(timerInterval);
    
    // 페이지 새로고침을 통해 모든 상태를 처음으로 되돌림
    location.reload();
}

/* 기록 반영 및 최종 결과 */
