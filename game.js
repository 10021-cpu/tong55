// --- Elements ---
const targetCanvas = document.getElementById('targetCanvas');
const targetCtx = targetCanvas.getContext('2d');
const drawCanvas = document.getElementById('drawCanvas');
const drawCtx = drawCanvas.getContext('2d');

const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const brushSizeVal = document.getElementById('brushSizeVal');
const eraserBtn = document.getElementById('eraserBtn');
const clearBtn = document.getElementById('clearBtn');
const submitBtn = document.getElementById('submitBtn');

const timerLabel = document.getElementById('timerLabel');
const progressFill = document.getElementById('progressFill');
const levelBadge = document.getElementById('levelBadge');

const resultModal = document.getElementById('resultModal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const scoreText = document.getElementById('scoreText');
const nextBtn = document.getElementById('nextBtn');

// --- Game Variables ---
let isDrawing = false;
let isEraser = false;
let currentLevel = 0;
let timeLeft = 30;
let timerInterval = null;
let totalScore = 0;
const totalTime = 30;

// --- Sound Effects (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freq, type, duration) {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

// --- Level Drawing Functions (ยากปานกลาง) ---
const levels = [
  // Level 1: เรือใบกลางทะเล
  {
    name: "เรือใบกลางทะเล",
    draw: (ctx) => {
      ctx.lineWidth = 4;
      // ดวงอาทิตย์
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(230, 70, 25, 0, Math.PI * 2);
      ctx.stroke();
      // ตัวเรือ
      ctx.strokeStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(70, 200);
      ctx.lineTo(230, 200);
      ctx.lineTo(200, 240);
      ctx.lineTo(100, 240);
      ctx.closePath();
      ctx.stroke();
      // ใบเรือ
      ctx.strokeStyle = '#2563eb';
      ctx.beginPath();
      ctx.moveTo(150, 70);
      ctx.lineTo(150, 195);
      ctx.lineTo(210, 195);
      ctx.closePath();
      ctx.stroke();
      // คลื่นทะเล
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(60, 255, 20, Math.PI, 0, true);
      ctx.arc(100, 255, 20, Math.PI, 0, true);
      ctx.arc(140, 255, 20, Math.PI, 0, true);
      ctx.arc(180, 255, 20, Math.PI, 0, true);
      ctx.stroke();
    }
  },
  // Level 2: จรวดอวกาศ
  {
    name: "จรวดอวกาศ",
    draw: (ctx) => {
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#475569';
      // ตัวจรวด
      ctx.beginPath();
      ctx.moveTo(150, 50);
      ctx.bezierCurveTo(190, 100, 190, 180, 190, 220);
      ctx.lineTo(110, 220);
      ctx.bezierCurveTo(110, 180, 110, 100, 150, 50);
      ctx.stroke();
      // หน้าต่าง
      ctx.strokeStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(150, 120, 20, 0, Math.PI * 2);
      ctx.stroke();
      // ปีกจรวด
      ctx.strokeStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(110, 170); ctx.lineTo(70, 230); ctx.lineTo(110, 220); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(190, 170); ctx.lineTo(230, 230); ctx.lineTo(190, 220); ctx.stroke();
      // เปลวไฟ
      ctx.strokeStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(125, 220); ctx.lineTo(150, 260); ctx.lineTo(175, 220); ctx.stroke();
    }
  },
  // Level 3: บ้านต้นไม้
  {
    name: "บ้านต้นไม้",
    draw: (ctx) => {
      ctx.lineWidth = 4;
      // ลำต้น
      ctx.strokeStyle = '#78350f';
      ctx.strokeRect(130, 160, 40, 110);
      // พุ่มไม้
      ctx.strokeStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(110, 120, 45, 0, Math.PI * 2);
      ctx.arc(190, 120, 45, 0, Math.PI * 2);
      ctx.arc(150, 80, 50, 0, Math.PI * 2);
      ctx.stroke();
      // ตัวบ้าน
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(125, 110, 50, 45);
      // หลังคา
      ctx.beginPath();
      ctx.moveTo(115, 110); ctx.lineTo(150, 80); ctx.lineTo(185, 110); ctx.closePath();
      ctx.stroke();
    }
  },
  // Level 4: หุ่นยนต์จิ๋ว
  {
    name: "หุ่นยนต์จิ๋ว",
    draw: (ctx) => {
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#334155';
      // หัว
      ctx.strokeRect(100, 60, 100, 70);
      // ตา
      ctx.strokeRect(120, 80, 20, 20);
      ctx.strokeRect(160, 80, 20, 20);
      // เสาอากาศ
      ctx.beginPath();
      ctx.moveTo(150, 60); ctx.lineTo(150, 35); ctx.stroke();
      ctx.beginPath();
      ctx.arc(150, 30, 7, 0, Math.PI * 2); ctx.stroke();
      // ตัว
      ctx.strokeRect(90, 150, 120, 90);
      // แขน
      ctx.beginPath();
      ctx.moveTo(90, 170); ctx.lineTo(60, 200); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(210, 170); ctx.lineTo(240, 200); ctx.stroke();
    }
  },
  // Level 5: เค้กวันเกิด
  {
    name: "เค้กวันเกิด",
    draw: (ctx) => {
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#db2777';
      // ชั้นเค้ก
      ctx.strokeRect(70, 170, 160, 80);
      ctx.strokeRect(95, 110, 110, 60);
      // เทียน
      ctx.strokeStyle = '#ea580c';
      ctx.strokeRect(143, 70, 14, 40);
      // เปลวไฟ
      ctx.strokeStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(150, 58, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
];

// --- Drawing Event Handlers ---
function startDrawing(e) {
  isDrawing = true;
  draw(e);
}

function stopDrawing() {
  isDrawing = false;
  drawCtx.beginPath();
}

function draw(e) {
  if (!isDrawing) return;
  const rect = drawCanvas.getBoundingClientRect();
  const clientX = e.clientX || (e.touches && e.touches[0].clientX);
  const clientY = e.clientY || (e.touches && e.touches[0].clientY);
  
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  drawCtx.lineWidth = brushSize.value;
  drawCtx.lineCap = 'round';
  drawCtx.lineJoin = 'round';

  if (isEraser) {
    drawCtx.strokeStyle = '#ffffff';
  } else {
    drawCtx.strokeStyle = colorPicker.value;
  }

  drawCtx.lineTo(x, y);
  drawCtx.stroke();
  drawCtx.beginPath();
  drawCtx.moveTo(x, y);
}

// --- Game Logic Functions ---
function loadLevel() {
  levelBadge.textContent = `ด่านที่ ${currentLevel + 1} / ${levels.length} (${levels[currentLevel].name})`;
  targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  
  levels[currentLevel].draw(targetCtx);
  resetTimer();
}

function resetTimer() {
  clearInterval(timerInterval);
  timeLeft = totalTime;
  updateTimerUI();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();

    if (timeLeft <= 5 && timeLeft > 0) {
      playSound(600, 'sine', 0.1);
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      playSound(200, 'sawtooth', 0.4);
      evaluateAndShowModal();
    }
  }, 1000);
}

function updateTimerUI() {
  timerLabel.textContent = `⏱️ เวลาเหลือ: ${timeLeft} วินาที`;
  const percentage = (timeLeft / totalTime) * 100;
  progressFill.style.width = `${percentage}%`;

  if (percentage > 50) {
    progressFill.style.backgroundColor = '#22c55e';
  } else if (percentage > 20) {
    progressFill.style.backgroundColor = '#eab308';
  } else {
    progressFill.style.backgroundColor = '#ef4444';
  }
}

function calculateAccuracy() {
  const w = 300, h = 300;
  const targetData = targetCtx.getImageData(0, 0, w, h).data;
  const userData = drawCtx.getImageData(0, 0, w, h).data;

  let targetPixels = 0;
  let matchedPixels = 0;
  let userExtraPixels = 0;

  for (let i = 3; i < targetData.length; i += 4) {
    const isTargetDrawn = targetData[i] > 20;
    const isUserDrawn = userData[i] > 20;

    if (isTargetDrawn) {
      targetPixels++;
      if (isUserDrawn) matchedPixels++;
    } else if (isUserDrawn) {
      userExtraPixels++;
    }
  }

  if (targetPixels === 0) return 0;
  let matchScore = (matchedPixels / targetPixels) * 100;
  let penalty = (userExtraPixels / targetPixels) * 20;
  let finalScore = Math.max(0, Math.min(100, Math.round(matchScore - penalty)));

  return finalScore;
}

function evaluateAndShowModal() {
  clearInterval(timerInterval);
  const score = calculateAccuracy();
  totalScore += score;
  scoreText.textContent = `${score}%`;

  if (currentLevel < levels.length - 1) {
    modalTitle.textContent = timeLeft === 0 ? "หมดเวลา! ⏰" : "เรียบร้อย! 🎉";
    modalDesc.textContent = "กำลังเปลี่ยนรูปให้อัตโนมัติใน 3 วินาที...";
    nextBtn.style.display = 'block';
    nextBtn.textContent = "ไปด่านถัดไป ➔";
    
    resultModal.classList.add('active');

    // เปลี่ยนด่านให้อัตโนมัติเมื่อครบ 3 วินาที
    setTimeout(() => {
      if (resultModal.classList.contains('active')) {
        nextLevel();
      }
    }, 3000);
  } else {
    // จบทุกด่าน
    const finalAvg = Math.round(totalScore / levels.length);
    modalTitle.textContent = "🏆 จบเกมทั้งหมดแล้ว!";
    scoreText.textContent = `${finalAvg}%`;
    modalDesc.textContent = `คะแนนเฉลี่ยรวมทุกด่านของคุณคือ ${finalAvg}%`;
    nextBtn.style.display = 'block';
    nextBtn.textContent = "เล่นใหม่อีกครั้ง 🔄";
    resultModal.classList.add('active');
  }
}

function nextLevel() {
  resultModal.classList.remove('active');
  if (currentLevel < levels.length - 1) {
    currentLevel++;
    loadLevel();
  } else {
    currentLevel = 0;
    totalScore = 0;
    loadLevel();
  }
}

// --- Event Listeners ---
drawCanvas.addEventListener('mousedown', startDrawing);
drawCanvas.addEventListener('mouseup', stopDrawing);
drawCanvas.addEventListener('mousemove', draw);
drawCanvas.addEventListener('mouseleave', stopDrawing);

drawCanvas.addEventListener('touchstart', (e) => { startDrawing(e); e.preventDefault(); });
drawCanvas.addEventListener('touchend', stopDrawing);
drawCanvas.addEventListener('touchmove', (e) => { draw(e); e.preventDefault(); });

brushSize.addEventListener('input', (e) => {
  brushSizeVal.textContent = `${e.target.value}px`;
});

eraserBtn.addEventListener('click', () => {
  isEraser = !isEraser;
  eraserBtn.classList.toggle('active', isEraser);
});

clearBtn.addEventListener('click', () => {
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
});

submitBtn.addEventListener('click', () => {
  playSound(800, 'sine', 0.2);
  evaluateAndShowModal();
});

nextBtn.addEventListener('click', nextLevel);

// เริ่มเกมด่านแรก
loadLevel();
