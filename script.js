let currentNewsIndex = 0;      // ���݂̃j���[�X���ڂ̃C���f�b�N�X�i0�`�j
let programTime = 0;           // �ԑg���ԁi�b�j
let remainingProgramTime = 0;  // �c��̔ԑg���ԁi�b�j
let timerInterval;             // �ԑg���ԃJ�E���g�_�E���p�^�C�}�[
let remainingCushionTime = 0;  // �N�b�V�������ԁi�b�j
let elapsedTime = 0;           // ���݂̃j���[�X���ڂ̎��ۂ̓Ǘ����ԁi�b�j
let newsTimes = [];            // �e�j���[�X���ڂ̗\��ځi�b�j�̔z��

// DOM����e�j���[�X���ڂ̗\��ځi�b�j���擾
function getNewsTimes() {
  let times = [];
  const inputs = document.querySelectorAll("#news-list .planned-time");
  inputs.forEach(input => {
    let value = Number(input.value);
    times.push(value || 0);
  });
  return times;
}

// �ԑg���ԂƊe�j���[�X���ڂ̗\��ڂ��珉���̃N�b�V�������Ԃ��v�Z
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

// �N�b�V�������Ԃ̕\���X�V
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

// ���Ԃ� mm:ss �`���Ƀt�H�[�}�b�g����
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// �^�C�}�[�J�n���̏���
function startTimer() {
  calculateCushionTime();
  newsTimes = getNewsTimes();
  document.getElementById("start").disabled = true;
  
  // Pre-start UI ���\���ɁARunning UI ��\��
  document.querySelector('.prestart-ui').style.display = "none";
  document.querySelector('.running-ui').style.display = "block";
  
  currentNewsIndex = 0;
  startNextNews();
  timerInterval = setInterval(updateTimer, 1000);
  
  const container = document.querySelector('.timer-container');
  container.classList.remove('pre-start');
  container.classList.add('running');
}

// �ԑg���Ԃ̃J�E���g�_�E���ƁA���݂̃j���[�X���ڂ̎��ۂ̓Ǘ����Ԃ̍X�V
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

// ���̃j���[�X���ڂ��J�n����
function startNextNews() {
  if (currentNewsIndex < newsTimes.length) {
    const titleInput = document.querySelectorAll("#news-list .news-title")[currentNewsIndex];
    const title = titleInput && titleInput.value.trim() !== "" ? titleInput.value : `�j���[�X ${currentNewsIndex + 1}`;
    document.getElementById("current-news").innerText = title;
    elapsedTime = 0;
  } else {
    clearInterval(timerInterval);
    document.getElementById("current-news").innerText = "�S�j���[�X�I��";
    document.getElementById("end-item").disabled = true;
    setTimeout(resetTimer, 3000);
  }
}

// ���ڏI���{�^�����������Ƃ��̏���
function endItem() {
  const plannedTime = newsTimes[currentNewsIndex] || 0;
  const diff = plannedTime - elapsedTime;
  remainingCushionTime += diff;
  updateCushionDisplay();
  
  currentNewsIndex++;
  startNextNews();
  elapsedTime = 0;
}

// ���Z�b�g�{�^���F�^�C�}�[�i�s��Ԃ����Z�b�g�i���͓��e�͕ێ��j
function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  elapsedTime = 0;
  remainingProgramTime = programTime;
  document.querySelector("#time-left .value").innerText = formatTime(remainingProgramTime);
  
  // Pre-start UI ���ĕ\���ARunning UI ���\���ɖ߂�
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

// �j���[�X���ڂ𓮓I�ɒǉ�����
function addNewsItem() {
  const newsList = document.getElementById("news-list");
  const newIndex = newsList.children.length + 1;
  const li = document.createElement("li");
  li.innerHTML = `
    <input type="text" class="news-title" placeholder="�j���[�X���� ${newIndex}">
    <input type="number" class="planned-time" placeholder="�\��ځi�b�j" oninput="calculateCushionTime()">
  `;
  newsList.appendChild(li);
  calculateCushionTime();
}
