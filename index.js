document.addEventListener('DOMContentLoaded', () => {

    const welcomeScreen = document.getElementById('welcome-screen');
    const questionScreen = document.getElementById('question-screen');
    const resultScreen = document.getElementById('result-screen');



    const playerForm = document.getElementById('player-form');
    const playerNameInput = document.getElementById('player-name');


    const currentPlayerDisplay = document.getElementById('current-player');

    const currentQuestionDisplay = document.getElementById('current-question');

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


    let questionsCount = quizData.length;
    resultTotal.innerHTML = questionsCount;
    totalQuestionsDisplay.innerHTML = questionsCount;


    playerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        currentPlayer = playerNameInput.value.trim();
        if (!currentPlayer) {
            alert('Enter your name');
            return;
        }
        currentPlayerDisplay.innerText = currentPlayer;
        resultPlayerName.innerText = currentPlayer;
        welcomeScreen.classList.remove('active');
        questionScreen.classList.add('active')
        loadQuestion(currentQuestion)
    })

    nextButton.addEventListener('click',() => {
        currentQuestion++;
        hasAnswered = false;
        feedbackContainer.classList.add('hidden');
        if(currentQuestion < questionsCount) {
            loadQuestion(currentQuestion);
        }else {
            showResults();
        }
    })


    restartButton.addEventListener('click', resetQuiz);

    function loadQuestion(index){
        currentQuestionDisplay.textContent = index+1;
        const question = quizData[index];
        questionText.innerHTML = question.question;
        optionsContainer.innerHTML = '';

        feedbackContainer.classList.add('hidden');
        feedbackContainer.classList.remove('correct');
        feedbackContainer.classList.remove('incorrect');

        question.options.forEach((el,i) => {
            const optionElement = optionTemplate.content.cloneNode(true)
            const radioInput = optionElement.querySelector('input')
            const label = optionElement.querySelector('label') 

            const optionId = `option ${index} - ${i} `
            radioInput.id = optionId;
            label.innerText = el;;

            const optionContainer = optionElement.querySelector('.option')

            optionContainer.addEventListener('click', (event) =>{
                if(!hasAnswered){
                    selectOption(i)
                }
            })

            optionsContainer.appendChild(optionElement)
        })
    }

    function showResults(){
        questionScreen.classList.remove('active')
        resultScreen.classList.add('active')

        const perecentage = Math.round((Score / questionsCount) * 100);
        resultPrecentage.innerText = `${perecentage}%`
        resultScore.innerText = Score; 
    }


    function selectOption(selectedIndex){
        if(hasAnswered) return;
        hasAnswered  = true;
        const questions = quizData[currentQuestion];
        const options = optionsContainer.querySelectorAll('.option')
        feedbackContainer.classList.remove('hidden')

        options.forEach((opt) =>{
            opt.classList.remove('correct')
            opt.classList.remove('incorrect')
        })

        const isCorrect = selectedIndex === questions.correctAnswer
        if(isCorrect){
            Score++;
            options[selectedIndex].classList.add('correct')
            
            feedbackContainer.classList.add('correct')

            feedbackText.innerText = `Correct! ${questions.explanation}`
           
            currentScoreDisplay.innerText = score


        } else {
            options[selectedIndex].classList.add('incorrect')
            
            feedbackContainer.classList.add('incorrect')

            feedbackText.innerText = `InCorrect! ${questions.explanation}`

        }

    }

    function resetQuiz(){
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
    }

});
