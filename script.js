// サービスワーカーの登録（必要な場合）
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

// スケジュールタイマー用のタイムアウトID
let scheduleTimeout = null;

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

// クッション時間の表示更新
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

// タイマー開始処理
function startTimer() {
  calculateCushionTime();
  newsTimes = getNewsTimes();
  document.getElementById("start").disabled = true;
  
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

// 番組時間のカウントダウンと、ニュース項目の読了時間更新
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

// 項目終了ボタン押下時の処理
function endItem() {
  const plannedTime = newsTimes[currentNewsIndex] || 0;
  const diff = plannedTime - elapsedTime;
  remainingCushionTime += diff;
  updateCushionDisplay();
  
  currentNewsIndex++;
  startNextNews();
  elapsedTime = 0;
}

// リセット処理（入力内容は保持）
function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  elapsedTime = 0;
  remainingProgramTime = programTime;
  document.querySelector("#time-left .value").innerText = formatTime(remainingProgramTime);
  
  // UIを元に戻す
  document.querySelector('.prestart-ui').style.display = "block";
  document.querySelector('.running-ui').style.display = "none";
  
  currentNewsIndex = 0;
  calculateCushionTime();
  document.getElementById("start").disabled = false;
  
  const container = document.querySelector('.timer-container');
  container.classList.remove('running');
  container.classList.add('pre-start');
  
  // 既にスケジュールされているタイマーがあればクリア
  if (scheduleTimeout) {
    clearTimeout(scheduleTimeout);
    scheduleTimeout = null;
  }
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

// 指定した開始時刻に自動でタイマーを開始する関数（テキスト入力対応）
// ※入力欄の onchange イベントで自動呼び出しされます
function scheduleTimer() {
  const startTimeInput = document.getElementById('start-time').value;
  if (!startTimeInput) return;
  
  // 入力値は "HH:MM:SS" または "HH:MM" 形式とする
  const parts = startTimeInput.split(':').map(Number);
  const targetHour = parts[0];
  const targetMinute = parts[1];
  const targetSecond = parts.length === 3 ? parts[2] : 0;
  
  const now = new Date();
  let targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMinute, targetSecond);
  
  // 指定時刻が現在より過去の場合は翌日に設定
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }
  
  const delay = targetTime.getTime() - now.getTime();
  console.log(`タイマーが ${targetTime.toLocaleTimeString()} に自動開始されます。（約 ${Math.round(delay/1000)} 秒後）`);
  
  // 既にスケジュールされているタイマーがあればクリア
  if (scheduleTimeout) {
    clearTimeout(scheduleTimeout);
  }
  
  scheduleTimeout = setTimeout(() => {
    startTimer();
  }, delay);
}
