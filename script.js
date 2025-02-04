// サービスワーカーの登録
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js")
    .then(() => console.log("Service Worker Registered"));
}

// グローバル変数の定義
let currentNewsIndex = 0;      // 現在のニュース項目のインデックス（0～）
let programTime = 0;           // 番組時間（秒）
let remainingProgramTime = 0;  // 残りの番組時間（秒）
let timerInterval;             // 番組時間カウントダウン用タイマー
let remainingCushionTime = 0;  // クッション時間（秒）
let elapsedTime = 0;           // 現在のニュース項目の実際の読了時間（秒）
let newsTimes = [];            // 各ニュース項目の予定尺（秒）の配列

// DOMから各ニュース項目の予定尺（秒）を取得する関数
function getNewsTimes() {
  let times = [];
  const inputs = document.querySelectorAll("#news-list .planned-time");
  inputs.forEach(input => {
    let value = Number(input.value);
    times.push(value || 0);
  });
  return times;
}

// 番組時間と各ニュース項目の予定尺から初期のクッション時間を計算する関数
function calculateCushionTime() {
  const minutes = Number(document.getElementById("program-time-minutes").value) || 0;
  const seconds = Number(document.getElementById("program-time-seconds").value) || 0;
  programTime = minutes * 60 + seconds;
  if (programTime) {
    remainingProgramTime = programTime;
  }
  
  newsTimes = getNewsTimes();
  const totalPlanned = newsTimes.reduce((a, b) => a + b, 0);
  
  remainingCushionTime = programTime - totalPlanned;
  updateCushionDisplay();
}

// クッション時間の表示を更新する関数
function updateCushionDisplay() {
  let displayText = "";
  if (remainingCushionTime < 0) {
    displayText = `- ${formatTime(Math.abs(remainingCushionTime))}`;
  } else {
    displayText = formatTime(remainingCushionTime);
  }
  document.querySelector("#cushion-time .value").innerText = displayText;
  document.querySelector("#pre-cushion-time .value").innerText = displayText;
}

// 秒数を mm:ss 形式にフォーマットする関数
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// タイマー開始時の処理を行う関数
function startTimer() {
  calculateCushionTime();
  newsTimes = getNewsTimes();
  document.getElementById("start").disabled = true;
  document.getElementById("schedule-start").disabled = true;
  
  // Pre‑start UI を非表示に、Running UI を表示
  document.querySelector('.prestart-ui').style.display = "none";
  document.querySelector('.running-ui').style.display = "block";
  
  currentNewsIndex = 0;
  startNextNews();
  timerInterval = setInterval(updateTimer, 1000);
  
  const container = document.querySelector('.timer-container');
  container.classList.remove('pre-start');
  container.classList.add('running');
}

// 番組時間のカウントダウンと、現在のニュース項目の実際の読了時間の更新を行う関数
function updateTimer() {
  remainingProgramTime--;
  elapsedTime++;
  
  if (remainingProgramTime <= 0) {
    document.querySelector("#time-left .value").innerText = "00:00";
    clearInterval(timerInterval);
  } else {
    document.querySelector("#time-left .value").innerText = formatTime(remainingProgramTime);
  }
}

// 次のニュース項目を開始する関数
function startNextNews() {
  if (currentNewsIndex < newsTimes.length) {
    const titleInput = document.querySelectorAll("#news-list .news-title")[currentNewsIndex];
    const title = titleInput && titleInput.value.trim() !== "" ? titleInput.value : `ニュース ${currentNewsIndex + 1}`;
    document.getElementById("current-news").innerText = title;
    elapsedTime = 0;
  } else {
    clearInterval(timerInterval);
    document.getElementById("current-news").innerText = "全ニュース終了";
    document.getElementById("end-item").disabled = true;
    setTimeout(resetTimer, 3000);
  }
}

// 項目終了ボタンを押したときの処理を行う関数
function endItem() {
  const plannedTime = newsTimes[currentNewsIndex] || 0;
  const diff = plannedTime - elapsedTime;
  remainingCushionTime += diff;
  updateCushionDisplay();
  
  currentNewsIndex++;
  startNextNews();
  elapsedTime = 0;
}

// リセットボタン：タイマー進行状態をリセットする関数（入力内容は保持）
function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  elapsedTime = 0;
  remainingProgramTime = programTime;
  document.querySelector("#time-left .value").innerText = formatTime(remainingProgramTime);
  
  // Pre‑start UI を再表示、Running UI を非表示に戻す
  document.querySelector('.prestart-ui').style.display = "block";
  document.querySelector('.running-ui').style.display = "none";
  
  currentNewsIndex = 0;
  calculateCushionTime();
  document.getElementById("start").disabled = false;
  document.getElementById("schedule-start").disabled = false;
  document.getElementById("end-item").disabled = false;
  
  const container = document.querySelector('.timer-container');
  container.classList.remove('running');
  container.classList.add('pre-start');
}

// ニュース項目を動的に追加する関数
function addNewsItem() {
  const newsList = document.getElementById("news-list");
  const newIndex = newsList.children.length + 1;
  const li = document.createElement("li");
  li.innerHTML = `
    <input type="text" class="news-title" placeholder="ニュース項目 ${newIndex}">
    <input type="number" class="planned-time" placeholder="予定尺（秒）" oninput="calculateCushionTime()">
  `;
  newsList.appendChild(li);
  calculateCushionTime();
}

// 指定した開始時刻にタイマーをスタートさせるための関数（秒まで対応）
function scheduleTimer() {
  const startTimeInput = document.getElementById('start-time').value;
  if (!startTimeInput) {
    alert("開始時刻を入力してください。");
    return;
  }
  
  // 入力値は "HH:MM:SS" または "HH:MM" 形式であると仮定
  const parts = startTimeInput.split(':').map(Number);
  const targetHour = parts[0];
  const targetMinute = parts[1];
  // パートが3つあれば秒も指定されている。なければ秒は0とする
  const targetSecond = parts.length === 3 ? parts[2] : 0;
  
  const now = new Date();
  // 本日の日付で対象時刻のDateオブジェクトを作成
  let targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMinute, targetSecond);
  
  // 対象時刻が現在より過去の場合は、翌日に設定する
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }
  
  const delay = targetTime.getTime() - now.getTime();
  console.log(`タイマーは ${delay / 1000} 秒後 (約 ${targetTime.toLocaleTimeString()} に) 開始されます。`);
  
  // 指定した時刻になるまで待ってから startTimer() を実行
  setTimeout(() => {
    startTimer();
  }, delay);
  
  alert(`タイマーは約 ${Math.round(delay / 1000)} 秒後 ( ${targetTime.toLocaleTimeString()} ) に開始されます。`);
}
