document.addEventListener('DOMContentLoaded', () => {



    const welcomeScreen = document.getElementById('welcome-screen');
    const questionScreen = document.getElementById('question-screen');
    const resultScreen = document.getElementById('result-screen');
    const quizProgress = document.getElementById('quiz-progress')
    const spinner = document.getElementById('loading-spinner');


    const adminForm = document.getElementById('admin-form')



    const playerForm = document.getElementById('player-form');
    const playerNameInput = document.getElementById('player-name');
    const selectedTheme = document.getElementById('questions-theme-select');
    const selectedLimit = document.getElementById('questions-limit-select');


    const startButton = document.getElementById('start-button')
    const requiestQuestionBtn = document.getElementById('requiest-question-btn')

    const currentPlayerDisplay = document.getElementById('current-player');

    const currentQuestionDisplay = document.getElementById('current-question');
    const totalQuestions = document.getElementById('total-questions');


    const currentScoreDisplay = document.getElementById('current-score');

    const totalQuestionsDisplay = document.getElementById('total-questions');




    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');

    const optionTemplate = document.getElementById('option-template')

    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackText = document.getElementById('feedback-text');
    const nextButton = document.getElementById('next-button');
    const showadminFormbtn = document.getElementById('show-adminForm-btn')
    const addToFavoriteButton = document.getElementById('favorite-heart')


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
    let isLastBatch = false;
    let isQuestionSaved = false;


    
    playerForm.addEventListener('submit', startGame)

    addToFavoriteButton.addEventListener('click', ()=> {
        if(isQuestionSaved) return;
        saveQuestionToFavorite()
        addToFavoriteButton.classList.remove('add-favorite')
        addToFavoriteButton.classList.add('added-favorite')
        isQuestionSaved= true
    })

    nextButton.addEventListener('click', () => {
        isQuestionSaved= false
        addToFavoriteButton.classList.remove('added-favorite')
        addToFavoriteButton.classList.add('add-favorite')
        questionScreen.classList.add('fade-out')
        feedbackContainer.classList.add('hidden')
        questionScreen.classList.remove('fade-out')
        setTimeout(() => {
            currentQuestion++;
            hasAnswered = false;
            if (currentQuestion < questionsCount) {
                loadQuestion(currentQuestion);
            } else {
                showIntermediateScreen();
            }
        }, 1000)
    })

    showadminFormbtn.addEventListener('click', () => {
        adminForm.classList.toggle('hidden')
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
            return fetch(`https://js-quiz-questions-server.vercel.app/api/questions?limit=${limit}&theme=${theme}`)
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



    adminForm.addEventListener('submit', (e) =>{handleSubmit(e)})

    function handleSubmit(e){
        e.preventDefault();
        const action = adminForm.querySelector('#admin-action').value;
        const questionData = {
            action: action,
            question: adminForm.querySelector('#question-input').value,
            options:[
                adminForm.querySelector('#option1').value,
                adminForm.querySelector('#option2').value,
                adminForm.querySelector('#option3').value,
                adminForm.querySelector('#option4').value
            ],
            correctAnswer: parseInt(adminForm.querySelector('#correct-answer').value),
            explanation: adminForm.querySelector('#explanation').value,
            theme: adminForm.querySelector('#theme').value,
        }
        console.log(questionData)

        if(action.toUpperCase() === 'POST'){
            SubmitNewQuestion(questionData)
        }

        switch(action.toUpperCase()){
            case 'POST':
                SubmitNewQuestion(questionData)
                break;
            case 'PUT':
                updateQuestion(questionData)
                break;
            case 'PUTCH':
                partialUpdateQuestion(questionData)
                break;
            case 'DELETE':
                deleteQuestion(questionData.theme, questionData.correctAnswer )
                break;
            default:
                alert('Invalid action. Please select Post')
        }


        function SubmitNewQuestion(questionData){
            fetch('https://js-quiz-questions-server.vercel.app/api/resource', {
                method:'POST',
                body: JSON.stringify(questionData),
                headers:{
                    'Content-Type': 'application/json'
                }
            })
        }

        function updateQuestion(questionData){
            fetch('https://js-quiz-questions-server.vercel.app/api/resource', {
                method:'PUT',
                body: JSON.stringify(questionData),
                headers:{
                    'Content-Type': 'application/json'
                }
            })
        }

        function partialUpdateQuestion(questionData){
            fetch('https://js-quiz-questions-server.vercel.app/api/resource', {
                method:'PUTCH',
                body: JSON.stringify(questionData),
                headers:{
                    'Content-Type': 'application/json'
                }
            })
        }

        function deleteQuestion(theme, question){
            fetch(`https://js-quiz-questions-server.vercel.app/api/resource?theme=${theme}&question=${question}=12`, {
                method:'DELETE',
                
            })
        }
    }
    
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
        resultPlayerName.innerText = currentPlayer;

        const actionsDiv = document.getElementById('result-actions');
        actionsDiv.innerHTML = ''; 
        const restartBtn = document.createElement('button');
        restartBtn.id = 'restart-button';
        restartBtn.textContent = 'Restart';
        restartBtn.classList.add('btn');
        restartBtn.addEventListener('click', () => {
            resetQuiz();
        });
        actionsDiv.appendChild(restartBtn);

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

    function continueQuiz() {
        if (isLastBatch) {
            // Если это последняя партия, просто показываем результаты
            showResultsWithThemeSwitch();
            return;
        }

        const theme = selectedTheme.value;
        const limit = selectedLimit.value
        const offset = quizData.length;
        const url = `https://js-quiz-questions-server.vercel.app/api/questions?limit=${limit}&theme=${theme}&offset=${offset}`;

        spinner.classList.remove('hidden');
        startButton.classList.add('hidden');
        requiestQuestionBtn.classList.add('hidden');

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(resData => {
                const newQuestions = resData.data;
                if (newQuestions.length === 0) {
                    // Вопросов больше нет
                    isLastBatch = true;
                    showResultsWithThemeSwitch();
                    return;
                }

                // Добавляем новые вопросы
                quizData.push(...newQuestions);
                questionsCount = quizData.length;
                // Обновляем отображение общего количества
                totalQuestionsDisplay.innerHTML = questionsCount;
                totalQuestions.textContent = questionsCount;
                resultTotal.innerHTML = questionsCount;

                // Если пришло меньше вопросов, чем лимит – это последняя партия
                if (newQuestions.length < limit) {
                    isLastBatch = true;
                }

                questionScreen.classList.add('active');
                resultScreen.classList.remove('active');

                // Следующий вопрос уже загружен, можно переходить к нему
                // currentQuestion сейчас равно старому questionsCount (индекс первого нового вопроса)
                hasAnswered = false;
                loadQuestion(currentQuestion);
            })
            .catch(error => {
                console.error('Ошибка загрузки следующей партии:', error);
                showErrorMessage('Не удалось загрузить следующую партию вопросов.');
                // Показываем кнопку "Повторить" или оставляем пользователя на экране результатов
                showResultsWithThemeSwitch();
            })
            .finally(() => {
                spinner.classList.add('hidden');
            });
    }

    function showResultsWithThemeSwitch() {
    questionScreen.classList.remove('active');
    resultScreen.classList.add('active');

    const percentage = Math.round((Score / questionsCount) * 100);
    resultPrecentage.innerText = `${percentage}%`;
    resultScore.innerText = Score;
    resultPlayerName.innerText = currentPlayer;

    const actionsDiv = document.getElementById('result-actions');
    actionsDiv.innerHTML = '';

    
    const changeThemeBtn = document.createElement('button');
    changeThemeBtn.id = 'change-theme-btn';
    changeThemeBtn.textContent = 'Сменить тему';
    changeThemeBtn.classList.add('btn');
    changeThemeBtn.addEventListener('click', () => {
        resetQuiz();         
        quizData = [];
        questionsCount = 0;
        currentQuestion = 0;
        Score = 0;
        isLastBatch = false;
    });

   
    const finishBtn = document.createElement('button');
    finishBtn.textContent = 'Завершить';
    finishBtn.classList.add('btn');
    finishBtn.addEventListener('click', () => {
        showResults(); 
    });

    actionsDiv.appendChild(changeThemeBtn);
    actionsDiv.appendChild(finishBtn);
}

    function resetQuiz() {
        currentQuestion = 0;
        Score = 0;
        currentPlayer = '';
        hasAnswered = false;
        quizData = [];
        questionsCount = 0;
        isLastBatch = false;

        currentPlayerDisplay.innerText = '';
        currentQuestionDisplay.innerText = currentQuestion
        feedbackContainer.classList.remove('correct', 'incorrect')
        playerNameInput.value = ''
        welcomeScreen.classList.add('active')
        resultScreen.classList.remove('active')
        playerForm.classList.remove('hidden')
    }

    function showIntermediateScreen() {
    
    questionScreen.classList.remove('active');
    resultScreen.classList.add('active');

    
    const percentage = Math.round((Score / questionsCount) * 100);
    resultPrecentage.innerText = `${percentage}%`;
    resultScore.innerText = Score;
    resultPlayerName.innerText = currentPlayer;

  
    const actionsDiv = document.getElementById('result-actions');
    actionsDiv.innerHTML = '';

   
    const continueBtn = document.createElement('button');
    continueBtn.textContent = 'Продолжить';
    continueBtn.classList.add('btn');
    continueBtn.addEventListener('click', () => {
       
        resultScreen.classList.remove('active');
       
        continueQuiz();
    });

    
    const finishBtn = document.createElement('button');
    finishBtn.textContent = 'Завершить';
    finishBtn.classList.add('btn');
    finishBtn.addEventListener('click', () => {
      
        showResults();
    });

    actionsDiv.appendChild(continueBtn);
    actionsDiv.appendChild(finishBtn);
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

        isLastBatch = false;

        requiestQuestionBtn.classList.add('hidden');
        const errorDiv = document.getElementById('fetch-error-message');
        if (errorDiv) errorDiv.textContent = '';
        spinner.classList.remove('hidden');
        startButton.classList.add('hidden');
        requiestQuestionBtn.classList.add('hidden')


        RequestNewQuestions(`https://js-quiz-questions-server.vercel.app/api/questions?limit=${limit}&theme=${theme}&offset=0`)
            .then(() => {
                startGameAfterLoad();
            })
            .catch(() => {
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

    function saveQuestionToFavorite() {
        const question = quizData[currentQuestion];
        const favoritesString = localStorage.getItem('favorites');
        const favorites = favoritesString ? JSON.parse(favoritesString) : [];
        //favorites.push(question);
        const newFavorites = [...favorites, question];
        const newFavoritesString = JSON.stringify(newFavorites)
        localStorage.setItem('favorites', newFavoritesString );
    }

    

    

    


});



/* Задание 1
Когда мы делаем запрос на сервер за базой вопросов, у нас есть задержка (пока сервер раздуплится). Надо сделать

Когда летит запрос, мы добавляем крутилку (дизайн на ваше усмотрение)
Когда запрос прилетает, мы крутилку удаляем
Если запрос прилетел с ошибкой, мы не запускаем игру, а показываем кнопку "перезапросить вопросы"
Если по нажатия кнопки "перезапросить вопросы" все равно прилетает ошибка, то делаем еще один запрос автоматически и если и он будет с ошибкой, то показываем красный текст "Ошибка сервера, попробуйте позже"
 */