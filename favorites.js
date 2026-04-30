const favoriteQuestions = JSON.parse(localStorage.getItem('favorites')) || [];

const favoriteContainer = document.getElementById('favorites-container');

const favoriteTemplate = document.getElementById('favorites-template');

function renderFavoriteQuestions() {
    favoriteContainer.innerHTML = ''
    favoriteQuestions.forEach((questionData, index) => {
        const questionElement = favoriteTemplate.content.cloneNode(true);

        questionElement.querySelector(`.question-text`).textContent = `${index} - ${questionData.question}`

        const optionContainer = questionElement.querySelector('.options-container')
        questionData.options.forEach((option, optionIndex) => {
            const optionDiv = document.createElement('div')
            optionDiv.classList.add('option')
            if (optionIndex === questionData.correctAnswer) {
                optionDiv.classList.add('correct')
            }
            optionDiv.innerHTML = `
            <input type ='radio' disabled name='option-${optionIndex}' id="option- ${index}- ${optionIndex}">
            <label for="option- ${index}- ${optionIndex}">${option}</label> 
            `
            optionContainer.appendChild(optionDiv);

            
        });
        questionElement.querySelector('.correct-answer').textContent = `Correct Answer: ${questionData.options[questionData.correctAnswer]} `;


            questionElement.querySelector('.explanation').textContent = questionData.explanation;


            questionElement.querySelector('.theme').textContent = `Theme: ${questionData.theme}`;

           favoriteContainer.appendChild(questionElement);
    });


}




renderFavoriteQuestions();



