
let difficulty;
let score = 0;
let qi = 0;
const num_questions = 10;
let questions;
let correct_index;

function chooseDifficulty(button){
    difficulty = button.id;
    questions = getQuestions();
    let start = document.getElementById('startscreen');
    start.style.display = 'none';
    console.log("Chosen difficulty: " + difficulty);
    console.log("Trivia game is starting!");
    newQuestion();
}

async function getQuestions(){
    const url = 'https://opentdb.com/api.php?amount=' + num_questions + '&difficulty=' + difficulty;
    const response = await fetch(url);
    const questions = await response.json();
    return questions.results;
}

function newQuestion(){
    if(qi == num_questions){
        showFinalResults();
        return;
    }
    questions.then(res => {
        document.getElementById('game').style.display = 'block';
        
        let question = res[qi];
        console.log(question.question);
        document.getElementById('question').innerHTML = question.question;

        if(question.incorrect_answers.length == 1){
            document.getElementById(1).innerHTML = 'True';
            document.getElementById(2).innerHTML = 'False';
            document.getElementById(3).style.display = 'none';
            document.getElementById(4).style.display = 'none';
            if(question.correct_answer === 'True')
                correct_index = 1;
            else
                correct_index = 2;
        }
        else {
            document.getElementById(3).style.display = 'inline';
            document.getElementById(4).style.display = 'inline';
            correct_index = Math.floor(Math.random() * 4) + 1;
            document.getElementById(correct_index).innerHTML = question.correct_answer;
            let j = 0;
            for(let i = 1; i <= 4; i++){
                if(i == correct_index)
                    continue;
                document.getElementById(i).innerHTML = question.incorrect_answers[j];
                j++;
            }
        }
        
        document.getElementById('question_index').innerHTML = qi+1;
        document.getElementById('num_questions').innerHTML = num_questions;
    });
    questions.catch(err => {
        alert('Failed to fetch data from Open Trivia Database (It may be down currently).')
    });
}

function answerQuestion(button){
    let x = button.id;
    if(x == correct_index){
        score += 10;
        console.log("Correct answer chosen.");
    }
    else {
        console.log("Incorrect answer chosen.");
    }
    qi++;
    newQuestion();
}

function showFinalResults(){
    document.getElementById('game').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    document.getElementById('score').innerHTML = score;
}

function playAgain(){
    document.getElementById('results').style.display = 'none';
    document.getElementById('startscreen').style.display = 'block';
    qi = 0;
    score = 0;
}
