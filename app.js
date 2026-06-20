const targetMinutesInput = document.querySelector("#target-minutes");
const targetSecondsInput = document.querySelector("#target-seconds");
const minimumMinutesInput = document.querySelector("#minimum-minutes");
const minimumSecondsInput = document.querySelector("#minimum-seconds");

const targetDisplay = document.querySelector("#target-display");
const minimumDisplay = document.querySelector("#minimum-display");
const elapsedDisplay = document.querySelector("#elapsed-display");
const remainingLabel = document.querySelector("#remaining-label");
const remainingDisplay = document.querySelector("#remaining-display");
const minimumCard = document.querySelector("#minimum-card");
const minimumBadge = document.querySelector("#minimum-badge");
const remainingCard = document.querySelector("#remaining-card");
const mainButton = document.querySelector("#main-button");
const resetButton = document.querySelector("#reset-button");

const state = {
  targetSeconds: 5 * 60,
  minimumSeconds: 4 * 60 + 30,
  elapsedBeforeStartMs: 0,
  startedAtMs: 0,
  status: "stopped",
};

let timerId = null;

function clampNumber(value, min, max) {
  const number = Number.parseInt(value, 10);

  if (Number.isNaN(number)) {
    return min;
  }

  return Math.min(Math.max(number, min), max);
}

function secondsFromInputs(minutesInput, secondsInput) {
  const minutes = clampNumber(minutesInput.value, 0, 999);
  const seconds = clampNumber(secondsInput.value, 0, 59);

  minutesInput.value = String(minutes);
  secondsInput.value = String(seconds);

  return minutes * 60 + seconds;
}

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getElapsedMs() {
  if (state.status !== "running") {
    return state.elapsedBeforeStartMs;
  }

  return state.elapsedBeforeStartMs + Date.now() - state.startedAtMs;
}

function getElapsedSeconds() {
  return Math.floor(getElapsedMs() / 1000);
}

function readSettings() {
  state.targetSeconds = secondsFromInputs(targetMinutesInput, targetSecondsInput);
  state.minimumSeconds = secondsFromInputs(minimumMinutesInput, minimumSecondsInput);
}

function updateDisplay() {
  const elapsedSeconds = getElapsedSeconds();
  const hasReachedMinimum = state.minimumSeconds > 0 && elapsedSeconds >= state.minimumSeconds;
  const hasExceededTarget = elapsedSeconds > state.targetSeconds;
  const remainingSeconds = Math.max(0, state.targetSeconds - elapsedSeconds);
  const overtimeSeconds = Math.max(0, elapsedSeconds - state.targetSeconds);

  targetDisplay.textContent = formatTime(state.targetSeconds);
  minimumDisplay.textContent = formatTime(state.minimumSeconds);
  elapsedDisplay.textContent = formatTime(elapsedSeconds);
  remainingLabel.textContent = hasExceededTarget ? "超過時間" : "残り時間";
  remainingDisplay.textContent = formatTime(hasExceededTarget ? overtimeSeconds : remainingSeconds);
  minimumBadge.hidden = !hasReachedMinimum;

  minimumCard.classList.toggle("metric-achieved", hasReachedMinimum);
  remainingCard.classList.toggle("metric-over", hasExceededTarget);

  if (state.status === "running") {
    mainButton.textContent = "一時停止";
  } else if (state.status === "paused") {
    mainButton.textContent = "再開";
  } else {
    mainButton.textContent = "開始";
  }
}

function startTimer() {
  if (state.status === "stopped") {
    state.elapsedBeforeStartMs = 0;
  }

  readSettings();
  state.startedAtMs = Date.now();
  state.status = "running";
  timerId = window.setInterval(updateDisplay, 250);
  updateDisplay();
}

function pauseTimer() {
  state.elapsedBeforeStartMs = getElapsedMs();
  state.status = "paused";
  window.clearInterval(timerId);
  timerId = null;
  updateDisplay();
}

function resetTimer() {
  window.clearInterval(timerId);
  timerId = null;
  state.elapsedBeforeStartMs = 0;
  state.startedAtMs = 0;
  state.status = "stopped";
  readSettings();
  updateDisplay();
}

function handleSettingChange() {
  readSettings();

  if (state.status === "stopped") {
    state.elapsedBeforeStartMs = 0;
  }

  updateDisplay();
}

mainButton.addEventListener("click", () => {
  if (state.status === "running") {
    pauseTimer();
    return;
  }

  startTimer();
});

resetButton.addEventListener("click", resetTimer);

for (const input of [targetMinutesInput, targetSecondsInput, minimumMinutesInput, minimumSecondsInput]) {
  input.addEventListener("change", handleSettingChange);
  input.addEventListener("input", handleSettingChange);
}

readSettings();
updateDisplay();
