const quizData = [
  {
    question: "What fruit or vegetable is carved to make a Jack-o'-lantern?",
    options: ["Watermelon", "Pumpkin", "Apple", "Pineapple"],
    correct: 1
  },
  {
    question: "What famous phrase do children say to get candy on Halloween?",
    options: ["Give me food!", "Trick or treat!", "Happy Birthday!", "Open the door!"],
    correct: 1
  },
  {
    question: "Which monster sleeps in a coffin and drinks blood?",
    options: ["Zombie", "Ghost", "Vampire", "Mummy"],
    correct: 2
  },
  {
    question: "What animal is traditionally associated with witches and bad luck?",
    options: ["Black cat", "Golden retriever", "Green frog", "White rabbit"],
    correct: 0
  },
  {
    question: "On which date is Halloween celebrated every year?",
    options: ["October 31", "November 1", "December 25", "September 30"],
    correct: 0
  },
  {
    question: "What spooky creature weaves webs to catch bugs?",
    options: ["Bat", "Spider", "Owl", "Rat"],
    correct: 1
  },
  {
    question: "Which monster is wrapped in white bandages and comes from ancient Egypt?",
    options: ["Frankenstein", "Werewolf", "Mummy", "Skeleton"],
    correct: 2
  },
  {
    question: "What do witches traditionally fly on?",
    options: ["Bicycle", "Broomstick", "Magic carpet", "Vacuum cleaner"],
    correct: 1
  },
  {
    question: "Which flying mammal comes out at night and hangs upside down?",
    options: ["Bat", "Crow", "Pigeon", "Eagle"],
    correct: 0
  },
  {
    question: "What traditional game involves biting floating apples without using hands?",
    options: ["Apple bobbing", "Apple catching", "Apple toss", "Apple pie race"],
    correct: 0
  }
];

// Твой рабочий вебхук
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1564958251974533271/CHT5bHzaTgq-RJKLSFAOz4hTGU5Jawn45K6L26fn-rLXP-CKy8WEw0mROc1TFaqto2cL";

let currentQuestionIndex = 0;
let score = 0;
let isAnswered = false;

const QUESTION_TIME = 60;
let timeLeft = QUESTION_TIME;
let timerInterval = null;

const counter = document.querySelector('.quiz-counter');
const progress = document.querySelector('.progress-fill');
const question = document.querySelector('.quiz-question');
const options = document.querySelector('.quiz-options');
const nextBtn = document.querySelector('.next-btn');
const timerText = document.getElementById('timer-text');
const timerBadge = document.querySelector('.timer-badge');
const optionButtons = document.querySelectorAll('.option-btn');

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = QUESTION_TIME;
  if (timerBadge) timerBadge.classList.remove('urgent');
  if (timerText) timerText.textContent = formatTime(timeLeft);

  timerInterval = setInterval(() => {
    timeLeft--;
    if (timerText) timerText.textContent = formatTime(timeLeft);

    if (timeLeft <= 15 && timerBadge) {
      timerBadge.classList.add('urgent');
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timeOut();
    }
  }, 1000);
}

function timeOut() {
  if (isAnswered) return;
  isAnswered = true;

  const correctIndex = quizData[currentQuestionIndex].correct;
  optionButtons[correctIndex].classList.add('correct');
  optionButtons.forEach(btn => btn.classList.add('disabled'));
}

function checkAnswer(selectedIndex) {
  if (isAnswered) return;
  isAnswered = true;
  clearInterval(timerInterval);

  const correctIndex = quizData[currentQuestionIndex].correct;

  if (selectedIndex === correctIndex) {
    optionButtons[selectedIndex].classList.add('correct');
    score++;
  } else {
    optionButtons[selectedIndex].classList.add('wrong');
    optionButtons[correctIndex].classList.add('correct');
  }

  optionButtons.forEach(btn => btn.classList.add('disabled'));
}

optionButtons.forEach((btn, index) => {
  btn.addEventListener('click', () => checkAnswer(index));
});

function loadQuestion() {
  isAnswered = false;

  optionButtons.forEach(btn => {
    btn.classList.remove('correct', 'wrong', 'disabled');
  });

  const current = quizData[currentQuestionIndex];

  question.textContent = current.question;
  counter.textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;

  const progressPercent = ((currentQuestionIndex + 1) / quizData.length) * 100;
  progress.style.width = `${progressPercent}%`;

  optionButtons.forEach((btn, i) => {
    const textSpan = btn.querySelector('.option-text');
    if (textSpan) {
      textSpan.textContent = current.options[i];
    } else {
      btn.textContent = current.options[i];
    }
  });

  startTimer();
}

nextBtn.addEventListener('click', () => {
  if (!isAnswered) return;

  currentQuestionIndex++;

  if (currentQuestionIndex < quizData.length) {
    loadQuestion();
  } else {
    showResults();
  }
});

function sendResultToDiscord(finalScore, total) {
  const percent = Math.round((finalScore / total) * 100);

  const payload = {
    username: "Halloween Quiz",
    avatar_url: "https://i.imgur.com/4M34hi2.png",
    embeds: [
      {
        title: "🎃 Завершено прохождение квиза!",
        color: 0xff7a00,
        fields: [
          {
            name: "Результат",
            value: `**${finalScore}** / **${total}**`,
            inline: true
          },
          {
            name: "Процент",
            value: `**${percent}%**`,
            inline: true
          }
        ],
        footer: {
          text: "Halloween Trivia Quiz"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
  .then(res => {
    if (res.ok) {
      console.log("Результат отправлен в Discord!");
    }
  })
  .catch(err => console.error("Ошибка отправки вебхука:", err));
}

function showResults() {
  clearInterval(timerInterval);
  if (timerBadge) timerBadge.style.display = 'none';
  progress.style.width = '100%';
  counter.textContent = "Quiz Completed";

  sendResultToDiscord(score, quizData.length);

  question.style.display = "none";
  options.style.display = "none";

  const card = document.querySelector('.quiz-card');
  const resultDiv = document.createElement('div');
  resultDiv.className = 'finish-screen';
  resultDiv.innerHTML = `
    <div class="finish-icon">🎃🏆</div>
    <h2>Great Job!</h2>
    <div class="finish-score">${score} / ${quizData.length}</div>
    <p style="color: var(--text-muted); margin-bottom: 24px;">
      ${score >= 7 ? "You are a True Halloween Master!" : "Not bad, but ghosts are still laughing at you!"}
    </p>
    <a href="quiz.html" class="btn-primary" style="margin-bottom: 12px;">Play Again</a>
    <a href="index.html" class="btn-primary" style="background: transparent; border: 1px solid var(--border-btn); color: var(--text-muted);">Main Menu</a>
  `;

  nextBtn.style.display = "none";
  card.appendChild(resultDiv);
}

loadQuestion();