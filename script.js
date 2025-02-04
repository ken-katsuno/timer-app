let currentNewsIndex = 0;      // 現在のニュース項目のインデックス（0～）
let programTime = 0;           // 番組時間（秒）
let remainingProgramTime = 0;  // 残りの番組時間（秒）
let timerInterval;             // 番組時間カウントダウン用タイマー
let remainingCushionTime = 0;  // クッション時間（秒）
let elapsedTime = 0;           // 現在のニュース項目の実際の読了時間（秒）
let newsTimes = [];            // 各ニュース項目の予定尺（秒）の配列

// DOMから各ニュース項目の予定尺（秒）を取得
function getNewsTimes() {
  let times = [];
  const inputs = document.querySelectorAll("#news-list .planned-time");
  inputs.forEach(input => {
    let value = Number(input.value);
    times.push(value || 0);
  });
  return times;
}

// 番組時間と各ニュース項目の予定尺から初期のクッション時間を計算
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

// 時間を mm:ss 形式にフォーマットする
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// タイマー開始時の処理
function startTimer() {
  calculateCushionTime();
  newsTimes = getNewsTimes();
  document.getElementById("start").disabled = true;
  
  // Pre-start UI を非表示に、Running UI を表示
  document.querySelector('.prestart-ui').style.display = "none";
  document.querySelector('.running-ui').style.display = "block";
  
  currentNewsIndex = 0;
  startNextNews();
  timerInterval = setInterval(updateTimer, 1000);
  
  const container = document.querySelector('.timer-container');
  container.classList.remove('pre-start');
  container.classList.add('running');
}

// 番組時間のカウントダウンと、現在のニュース項目の実際の読了時間の更新
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

// 次のニュース項目を開始する
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

// 項目終了ボタンを押したときの処理
function endItem() {
  const plannedTime = newsTimes[currentNewsIndex] || 0;
  const diff = plannedTime - elapsedTime;
  remainingCushionTime += diff;
  updateCushionDisplay();
  
  currentNewsIndex++;
  startNextNews();
  elapsedTime = 0;
}

// リセットボタン：タイマー進行状態をリセット（入力内容は保持）
function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  elapsedTime = 0;
  remainingProgramTime = programTime;
  document.querySelector("#time-left .value").innerText = formatTime(remainingProgramTime);
  
  // Pre-start UI を再表示、Running UI を非表示に戻す
  document.querySelector('.prestart-ui').style.display = "block";
  document.querySelector('.running-ui').style.display = "none";
  
  currentNewsIndex = 0;
  calculateCushionTime();
  document.getElementById("start").disabled = false;
  document.getElementById("end-item").disabled = false;
  
  const container = document.querySelector('.timer-container');
  container.classList.remove('running');
  container.classList.add('pre-start');
}

// ニュース項目を動的に追加する
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
