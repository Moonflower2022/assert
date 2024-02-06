import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set, get} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCRkg-0X9q4mVRtDIN5fBwR5Np3oxcr-ZA",
    authDomain: "curious-pondering.firebaseapp.com",
    databaseURL: "https://curious-pondering-default-rtdb.firebaseio.com",
    projectId: "curious-pondering",
    storageBucket: "curious-pondering.appspot.com",
    messagingSenderId: "820622108297",
    appId: "1:820622108297:web:7207c3846b34d084054858",
    measurementId: "G-8PTVT8B5MF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const database = getDatabase(app)

var statementList = [
    "Tabs are better than spaces",
    "Dogs are better than cats", 
    "Pineapple on pizza is acceptable",
    "Vanilla ice cream is better than chocolate ice cream",
    "Skydiving is better than bungee jumping",
    "I would rather fight an ostrich in a one-on-one deathmatch armed with a gun and minimal training than live allergic to sunlight, confined underground with limited visitors, spotty wifi, and the risk of death upon sunlight exposure via ostrich",
    "Experiencing large amounts of pain for a short period of time is better than experiencing small amounts of pain for a long period of time",
    "The sentence 'I want to put a hyphen between the words Fish and And and And and Chips in my Fish-And-Chips sign' would be clearer if quotation marks had been placed before Fish, and between Fish and and, and and and And, and And and and, and and and And, and And and and, and and and Chips, as well as after Chips"
]


var min = 1
var max = 7

var opinionConversion = {
    1: "Strongly disagree",
    2: "Disagree",
    3: "Slightly disagree",
    4: "Neutral",
    5: "Slightly agree",
    6: "Agree",
    7: "Strongly agree"
}

var opinionLevelConversion = {
    0: "Neutral",
    1: "Slightly",
    2: "Normal",
    3: "Strongly"
}

function resetDatabase(statementList, min, max) {
    for (const statement of statementList){
        for (let i = min; i <= max; i++){
            const optionRef = ref(database, `/${statement}/${i}`)
            
            get(optionRef).then((snapshot) => {
                if (typeof snapshot.val() != 'number') throw new Error("option is not number wah wah wah!!!")
                set(optionRef, 0);
            })
        }
    }
}

function updateDatabase(question, option){
    const optionRef = ref(database, `/${question}/${option}`);

    // Increment the value in the database
    return new Promise ((resolve, reject) => {
        get(optionRef).then((snapshot) => {
            if (typeof snapshot.val() != 'number') throw new Error("option is not number wah wah wah!!!")
            set(optionRef, (snapshot.val() || 0) + 1);
            resolve();
        }).catch(reject)
    })
    
}

function arraySum(arr){
    return arr.reduce((a, b) => a + b, 0)
}

async function fetchData(ref){
    var snapshot = await get(ref);
    return snapshot.val();
}

async function getInfo(question){
    const optionRef = ref(database, `/${question}`)

    return fetchData(optionRef).then((result) => {
        var pointsSum = 0
        var absSum = 0

        for (let i = min; i <= max; i++){
            if (typeof result[i] != 'number') throw new Error("option is not number wah wah wah!!!")
            pointsSum += result[i] * i
            absSum += result[i] * Math.abs(i - (max + min) / 2)
        }

        return [pointsSum / arraySum(result), absSum / arraySum(result), arraySum(result)]
    })
}

function updateVoted(voted, question, option){
    voted[question] = option * 1
    localStorage.setItem("voted", JSON.stringify(voted))
    return voted
}

function initVoted(statementList){
    var ret = {}
    for (const statement of statementList){
        ret[statement] = null
    }
    return ret
}

async function handleButtonClick(event){
    event.preventDefault()
    const question = this.closest('.statement-container').querySelector('.statement-text').textContent
    const question_input = question.substring(0, question.length - 1);
    const option = this.parentNode.querySelector('.slider').value;
    this.parentNode.querySelector('.slider').setAttribute('disabled', 'true')
    this.style.display = "none";

    voted = updateVoted(voted, question, option)

    await updateDatabase(question_input, option);

    const [averageOpinion, averageOpinionLevel, votes] = await getInfo(question_input)

    console.log(averageOpinion)

    const result = this.parentNode.querySelector('.result')

    const averageOpinionLevelDiv = document.createElement("div")
    
    averageOpinionLevelDiv.innerHTML = "Average opinion level: " + opinionLevelConversion[Math.round(averageOpinionLevel)]
    averageOpinionLevelDiv.style.marginTop = "10px";
    averageOpinionLevelDiv.className = "text"

    result.appendChild(averageOpinionLevelDiv)

    const averageOpinionDiv = document.createElement("div")
    
    averageOpinionDiv.innerHTML = "Average: " + opinionConversion[Math.round(averageOpinion)]
    averageOpinionDiv.style.marginTop = "10px";
    averageOpinionDiv.className = "text-bold"

    result.appendChild(averageOpinionDiv)
    if (votes > 21){
        const votesDiv = document.createElement("div")
    
        votesDiv.innerHTML = "Votes: " + votes.toString()
        votesDiv.style.marginTop = "10px";
        votesDiv.className = "text-italic"

        result.appendChild(votesDiv)
    }
}

async function triggerButton(button, option){
    const question = button.closest('.statement-container').querySelector('.statement-text').textContent
    const question_input = question.substring(0, question.length - 1);
    button.parentNode.querySelector('.slider').value = option.toString();
    button.parentNode.querySelector('.slider').setAttribute('disabled', 'true')
    button.style.display = "none";

    const [averageOpinion, averageOpinionLevel, votes] = await getInfo(question_input)

    console.log(averageOpinion)

    const result = button.parentNode.querySelector('.result')

    const averageOpinionLevelDiv = document.createElement("div")
    
    averageOpinionLevelDiv.innerHTML = "Average opinion level: " + opinionLevelConversion[Math.round(averageOpinionLevel)]
    averageOpinionLevelDiv.style.marginTop = "10px";
    averageOpinionLevelDiv.className = "text"

    result.appendChild(averageOpinionLevelDiv)

    const averageOpinionDiv = document.createElement("div")
    
    averageOpinionDiv.innerHTML = "Average: " + opinionConversion[Math.round(averageOpinion)]
    averageOpinionDiv.style.marginTop = "10px";
    averageOpinionDiv.className = "text-bold"

    result.appendChild(averageOpinionDiv)
    if (votes > 21){
        const votesDiv = document.createElement("div")
    
        votesDiv.innerHTML = "Votes: " + votes.toString()
        votesDiv.style.marginTop = "10px";
        votesDiv.className = "text-italic"

        result.appendChild(votesDiv)
    }
}

document.querySelectorAll('#submit').forEach(button => {
    button.addEventListener('click', handleButtonClick);
    button.addEventListener('touchstart', handleButtonClick);
});

var voted = JSON.parse(localStorage.getItem("voted")) || initVoted(statementList)

document.addEventListener('DOMContentLoaded', function() {
    const statementContainers = document.querySelectorAll('.statement-container');

    for (const container of statementContainers) {
        const statementText = container.querySelector('.statement-text').textContent;

        // Check if the current statement matches the target question text
        if (voted[statementText] != null) {
            // If a match is found, get the submit button within the container
            const submitButton = container.querySelector('.button');

            triggerButton(submitButton, voted[statementText]);
        }
    }

});

//resetDatabase(statementList, min, max)