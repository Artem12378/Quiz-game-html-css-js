document.addEventListener('DOMContentLoaded', () => {


   
    const welcomeScreen = document.getElementById('welcome-screen');
    const questionScreen = document.getElementById('question-screen');
    const resultScreen = document.getElementById('result-screen');
    const quizProgress = document.getElementById('quiz-progress')
    const spinner = document.getElementById('loading-spinner');


    const playerForm = document.getElementById('player-form');
    const playerNameInput = document.getElementById('player-name');
    const selectedTheme = document.getElementById('questions-theme-select');
    const selectedLimit = document.getElementById('questions-limit-select');


    const startButton = document.getElementById('start-button')
    const requiestQuestionBtn = document.getElementById('requiest-question-btn')

    const currentPlayerDisplay = document.getElementById('current-player');

    const currentQuestionDisplay = document.getElementById('current-question');
    const totalQuestions = document.getElementById('total-questions')


    const currentScoreDisplay = document.getElementById('current-score');

    const totalQuestionsDisplay = document.getElementById('current-score');




    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');

    const optionTemplate = document.getElementById('option-template')

    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackText = document.getElementById('feedback-text');
    const nextButton = document.getElementById('next-button');



    const resultPlayerName = document.getElementById('result-playerName')
    const resultScore = document.getElementById('result-score')
    const resultPrecentage = document.getElementById('result-precentage')
    const restartButton = document.getElementById('restart-button')
    const resultTotal = document.getElementById('result-total')

    let currentQuestion = 0;
    let Score = 0;
    let currentPlayer = '';
    let hasAnswered = false;
    let quizData = []
    let isLoading = true
    let isError = false
     let questionsCount = 0;




    playerForm.addEventListener('submit', startGame)

    nextButton.addEventListener('click', () => {
        questionScreen.classList.add('fade-out')
        feedbackContainer.classList.add('hidden')
        questionScreen.classList.remove('fade-out')
        setTimeout(() => {
            currentQuestion++;
            hasAnswered = false;
            if (currentQuestion < questionsCount) {
                loadQuestion(currentQuestion);
            } else {
                showResults();
            }
        }, 1000)
    })

    requiestQuestionBtn.addEventListener('click', () => {
        // Берём значения из селектов
        const theme = selectedTheme.value;
        const limit = selectedLimit.value;
        

        // Сброс UI
        requiestQuestionBtn.classList.add('hidden');
        spinner.classList.remove('hidden');
        startButton.classList.add('hidden');
        const errorDiv = document.getElementById('fetch-error-message');
        if (errorDiv) errorDiv.textContent = '';

        // Функция для одного запроса (возвращает промис)
        function performRequest() {
            return fetch(`https://jыs-quiz-questions-server.vercel.app/api/questions?limit=${limit}&theme=${theme}`)
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json();
                })
                .then(resData => {
                    quizData = resData.data;
                    questionsCount = quizData.length;
                    resultTotal.innerHTML = questionsCount;
                    totalQuestionsDisplay.innerHTML = questionsCount;
                    totalQuestions.textContent = resData.data.length;
                });
        }

        // Первый запрос
        performRequest()
            .then(() => {
                startGameAfterLoad();
            })
            .catch(() => {
                // Автоматический повтор
                performRequest()
                    .then(() => {
                        startGameAfterLoad();
                    })
                    .catch(() => {
                        showErrorMessage('Ошибка сервера, попробуйте позже');
                        requiestQuestionBtn.classList.remove('hidden');
                        startButton.classList.add('hidden');
                    })
                    .finally(() => {
                        spinner.classList.add('hidden');
                    });
            });
    });

    restartButton.addEventListener('click', resetQuiz);

    function loadQuestion(index) {
        currentQuestionDisplay.textContent = index + 1;

        const question = quizData[index];
        questionText.innerHTML = question.question;
        optionsContainer.innerHTML = '';

        feedbackContainer.classList.add('hidden');
        feedbackContainer.classList.remove('correct');
        feedbackContainer.classList.remove('incorrect');




        question.options.forEach((el, i) => {
            const optionElement = optionTemplate.content.cloneNode(true)
            const radioInput = optionElement.querySelector('input')
            const label = optionElement.querySelector('label')

            const optionId = `option ${index} - ${i} `
            radioInput.id = optionId;
            label.innerText = el;;

            const optionContainer = optionElement.querySelector('.option')



            optionContainer.addEventListener('click', (event) => {
                if (!hasAnswered) {
                    selectOption(i)
                }
            })

            optionsContainer.appendChild(optionElement)
        })
    }

    function showResults() {
        questionScreen.classList.remove('active')
        resultScreen.classList.add('active')

        const perecentage = Math.round((Score / questionsCount) * 100);
        resultPrecentage.innerText = `${perecentage}%`
        resultScore.innerText = Score;
    }


    function selectOption(selectedIndex) {
        if (hasAnswered) return;
        hasAnswered = true;
        const questions = quizData[currentQuestion];
        const options = optionsContainer.querySelectorAll('.option')
        feedbackContainer.classList.remove('hidden')

        options.forEach((opt) => {
            opt.classList.remove('correct')
            opt.classList.remove('incorrect')
        })



        const isCorrect = selectedIndex === questions.correctAnswer
        if (isCorrect) {
            Score++;
            options[selectedIndex].classList.add('correct')

            feedbackContainer.classList.add('correct')

            feedbackText.innerText = `Correct! ${questions.explanation}`

            currentScoreDisplay.innerText = Score


        } else {
            options[selectedIndex].classList.add('incorrect')

            feedbackContainer.classList.add('incorrect')

            feedbackText.innerText = `InCorrect! ${questions.explanation}`

        }

    }

    function resetQuiz() {
        currentQuestion = 0;
        Score = 0;
        currentPlayer = '';
        hasAnswered = false;

        currentPlayerDisplay.innerText = ''
        currentQuestionDisplay.innerText = currentQuestion
        feedbackContainer.classList.remove('correct', 'incorrect')
        playerNameInput.value = ''
        welcomeScreen.classList.add('active')
        resultScreen.classList.remove('active')
        playerForm.classList.remove('hidden')
    }


    function startGame(event) {
        event.preventDefault();


        currentPlayer = playerNameInput.value.trim();
        if (!currentPlayer) {
            alert('Enter your name');
            return;
        }

        const theme = selectedTheme.value
        const limit = selectedLimit.value

        requiestQuestionBtn.classList.add('hidden');
        const errorDiv = document.getElementById('fetch-error-message');
        if (errorDiv) errorDiv.textContent = '';
        spinner.classList.remove('hidden');
        startButton.classList.add('hidden');
        requiestQuestionBtn.classList.add('hidden')

        RequestNewQuestions(`https://jss-quiz-questions-server.vercel.app/api/questions?limit=${limit}&theme=${theme}`)
            .then(() => {
                startGameAfterLoad();
            })
            .catch(()=> {
                requiestQuestionBtn.classList.remove('hidden');
                startButton.classList.add('hidden');
                showErrorMessage('Не удалось загрузить вопросы. Нажмите "Restart questions".');
            }
                
        )


    }

    function showErrorMessage(msg) {
        // Создаём или находим элемент для ошибок
        let errorDiv = document.getElementById('fetch-error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'fetch-error-message';
            errorDiv.style.color = 'red';
            errorDiv.style.marginTop = '10px';
            errorDiv.style.textAlign = 'center';
            playerForm.appendChild(errorDiv);
        }
        errorDiv.textContent = msg;
        ;
    }

    function startGameAfterLoad() {
        let countDown = 3;
        const countDownElement = document.createElement('div');
        countDownElement.classList.add('countDown');
        welcomeScreen.appendChild(countDownElement);
        countDownElement.innerText = countDown;

        playerForm.classList.add('hidden');

        const timer = setInterval(() => {
            countDown--;
            countDownElement.innerText = countDown;
            if (countDown <= 0) {
                countDownElement.remove();
                clearInterval(timer);

                currentPlayerDisplay.innerText = currentPlayer;
                resultPlayerName.innerText = currentPlayer;
                welcomeScreen.classList.remove('active');
                questionScreen.classList.add('active');
                loadQuestion(currentQuestion);
            }
        }, 1000);
    }

    function RequestNewQuestions(url) {
        spinner.classList.remove('hidden');
        startButton.classList.add('hidden');
        requiestQuestionBtn.classList.add('hidden');

        return fetch(url)
            .then((res) => res.json())
            .then((resData) => {
                quizData = resData.data
                questionsCount = quizData.length;
                resultTotal.innerHTML = questionsCount;
                totalQuestionsDisplay.innerHTML = questionsCount;
                totalQuestions.textContent = resData.data.length
            })
            .catch((error) => {
                console.error(`Error fetching quiz questions:`, error);
                requiestQuestionBtn.classList.remove('hidden');
                startButton.classList.add('hidden')
                throw error

            })
            .finally(() => {


                spinner.classList.add('hidden');
            });
    }



});



/* Задание 1
Когда мы делаем запрос на сервер за базой вопросов, у нас есть задержка (пока сервер раздуплится). Надо сделать

Когда летит запрос, мы добавляем крутилку (дизайн на ваше усмотрение)
Когда запрос прилетает, мы крутилку удаляем
Если запрос прилетел с ошибкой, мы не запускаем игру, а показываем кнопку "перезапросить вопросы"
Если по нажатия кнопки "перезапросить вопросы" все равно прилетает ошибка, то делаем еще один запрос автоматически и если и он будет с ошибкой, то показываем красный текст "Ошибка сервера, попробуйте позже"
 */