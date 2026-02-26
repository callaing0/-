/*  공통 변수 및 초기화 */
let currentPrice = 0;      // 현재 입찰가
let timeLeft = 60;         // 남은 시간
let timerInterval = null;  // 타이머 제어용

let highestBidder = ""; // 최고가 입찰자(낙찰자 후보)
let bidLogs = []; //{name, amount, secLeft}

/* 작품 선택 및 경매 시작 */

function selectArt(title, artist, price, estimate) {
    // 1. 클릭된 카드 요소 가져오기
    const clickedCard = window.event.currentTarget;
    
    // 2. 카드 내부에 실제 적혀있는 텍스트 추출 (핵심 수정 사항)
    const realTitle = clickedCard.querySelector('h3').innerText;
    const realArtist = clickedCard.querySelector('.artist').innerText;
    const selectedImgSrc = clickedCard.querySelector('img').src;

    // 3. 화면 섹션 전환
    document.getElementById('catalog-section').classList.add('hidden');
    document.getElementById('auction-room').classList.remove('hidden');

    // 4. 추출한 실제 정보를 경매장에 반영
    document.getElementById('art-title').innerText = realTitle;   // 전달받은 인자 대신 realTitle 사용
    document.getElementById('art-artist').innerText = realArtist; // 전달받은 인자 대신 realArtist 사용
    document.getElementById('auction-art-img').src = selectedImgSrc;

    // 5. 경매 데이터 초기화
    currentPrice = Number(price);
    timeLeft = 60;
    highestBidder = ""; 

    // 입찰가 입력칸에 현재가 자동 입력
    const amountInput = document.getElementById('bid-amount');
    if (amountInput) amountInput.value = currentPrice;

    // 6. UI 및 타이머 초기화
    document.getElementById('seconds').innerText = timeLeft;
    document.getElementById('bid-history').innerHTML = "";
    
    // 입력창 및 버튼 활성화
    document.getElementById('bidder-name').disabled = false;
    document.getElementById('bid-amount').disabled = false;
    const bidButtons = document.querySelectorAll('.btn-bid');
    bidButtons.forEach(button => button.disabled = false);

    window.scrollTo(0, 0);
    updateUI();
    startTimer();

    bidLogs = [];
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

function submitBid() {
    if (timeLeft <= 0) return;

    const nameInput = document.getElementById('bidder-name');
    const amountInput = document.getElementById('bid-amount');

    const bidderName = nameInput ? nameInput.value.trim() : "";
    const bidAmount = amountInput ? Number(amountInput.value) : NaN;

    // 입력 검증
    if (!bidderName) {
        alert("이름을 입력하세요.");
        return;
    }
    if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
        alert("올바른 입찰 금액을 입력하세요.");
        return;
    }

    // ✅ 핵심 요구사항: 최고가 이하이면 입찰 불가
    if (bidAmount <= currentPrice) {
        alert(`현재 최고가(₩${currentPrice.toLocaleString()})보다 큰 금액만 입찰할 수 있습니다.`);
        return;
    }

    // 최고가 갱신
    currentPrice = bidAmount; // 최고가
    highestBidder = bidderName; // 낙찰자

    // 입찰 성공시 기록 저장(결과화면 표시용)
    bidLogs.unshift({ name: bidderName, amount: currentPrice, secLeft: timeLeft });

    // 입찰 기록 추가 (누가, 얼마, 몇 초에)
    const historyList = document.getElementById('bid-history');
    if (historyList) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="history-user">${bidderName}</span>
            <span class="history-price" style="float: right;">
              ₩${currentPrice.toLocaleString()} (${timeLeft}s)
            </span>
        `;
        historyList.prepend(li);
    }

    // 입력값 정리(선택)
    if (amountInput) amountInput.value = currentPrice;

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

        const winnerEl = document.getElementById('winner-info');
        const priceEl = document.getElementById('final-price-display');

        if (highestBidder) {
            if (winnerEl) winnerEl.innerText = `낙찰자: ${highestBidder}`;
            if (priceEl) priceEl.innerText = `낙찰가: ₩${currentPrice.toLocaleString()}`;
        } else {
            if (winnerEl) winnerEl.innerText = `낙찰자: (입찰 없음)`;
            if (priceEl) priceEl.innerText = `낙찰가: ₩${currentPrice.toLocaleString()}`;
        }
    }

    // 2. 입찰 버튼 비활성화 (기존 코드 유지)
    const bidButtons = document.querySelectorAll('.btn-bid');
    bidButtons.forEach(button => {
        button.disabled = true;
    });

    // 입력창 비활성화 (기존 코드 유지)
    document.getElementById('bidder-name').disabled = true;
    document.getElementById('bid-amount').disabled = true;

    // 3. 타이머 정지 (기존 코드 유지)
    if (timerInterval) clearInterval(timerInterval);

    // ✅ 결과 모달에 입찰 기록 출력
    const resultHistoryEl = document.getElementById('result-bid-history');
    if (resultHistoryEl) {
    resultHistoryEl.innerHTML = "";

        if (bidLogs.length === 0) {
            const li = document.createElement('li');
            li.textContent = "입찰 기록이 없습니다.";
            resultHistoryEl.appendChild(li);
        } else {
            bidLogs.forEach(log => {
            const li = document.createElement('li');
            li.textContent = `${log.name} / ₩${log.amount.toLocaleString()} / ${log.secLeft}초`;
            resultHistoryEl.appendChild(li);
            });
        }
    }
}

/* 초기화 (Back to Collection) */
function resetGallery() {
    if (timerInterval) clearInterval(timerInterval);
    
    // 페이지 새로고침을 통해 모든 상태를 처음으로 되돌림
    location.reload();
}

/* 기록 반영 및 최종 결과 */
