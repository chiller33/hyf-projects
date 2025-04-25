const searchBox = document.getElementById("search-box");
const sortButton = document.getElementById("sort-button");
const resetButton = document.getElementById("reset-button");

const startTimerButton = document.getElementById("start-timer");
const timerInput = document.getElementById("timer-input");
const timerDisplay = document.getElementById("timer-display");

const searchButton = document.getElementById("search-button");
const ingredientInput = document.getElementById("ingredient-input");
const priceOutput = document.getElementById("price-output");

searchBox.addEventListener("input", () => {
    const searchTerm = searchBox.value.toLowerCase();

    document.getElementById("recipe-display").innerHTML = "";

    const filtered = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm)
    );

    filtered.forEach(displayRecipe);
})

sortButton.addEventListener("click", () => {
    const sortedRecipes = [...recipes].sort((a, b) => {
        return a.ingredients.length - b.ingredients.length;
    });
    
    document.getElementById("recipe-display").innerHTML = "";
    
    sortedRecipes.forEach(displayRecipe);
})

resetButton.addEventListener("click", () => {
    document.getElementById("recipe-display").innerHTML = "";
    
    recipes.forEach(displayRecipe);
})

function startCookingTimer() {
    let timeInMinutes = parseInt(timerInput.value, 10);
    
    if (isNaN(timeInMinutes) || timeInMinutes <= 0) {
        alert("Please enter a valid time in minutes.");
        return;
    }

    let timeInSeconds = timeInMinutes * 60;
    timerDisplay.textContent = `Time Remaining: ${timeInMinutes} minutes`;
    
    const intervalId = setInterval(() => {
        timeInSeconds--;

        const minutesLeft = Math.floor(timeInSeconds / 60);
        const secondsLeft = timeInSeconds % 60;
        let displaySeconds = secondsLeft;
        if (secondsLeft < 10) {
            displaySeconds = '0' + secondsLeft;
        }
        
        timerDisplay.textContent = `Time Remaining: ${minutesLeft}:${displaySeconds}`;

        if (timeInSeconds <= 0) {
            clearInterval(intervalId);
            playTimerSound();
            alert("Time's up! Your recipe is ready!");
        }
    }, 1000);
}

// Sound to play when the timer is up
function playTimerSound() {
    const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
    audio.play();
}

startTimerButton.addEventListener('click', startCookingTimer);

let startTime = Date.now();

function updateTimeSpent() {
    const currentTime = Date.now();
    const timeElapsedInSeconds = Math.floor((currentTime - startTime) / 1000); // Calculate elapsed time in seconds
    const minutes = Math.floor(timeElapsedInSeconds / 60);
    const seconds = timeElapsedInSeconds % 60;

    let displaySeconds = seconds;
    if (seconds < 10) {
        displaySeconds = '0' + seconds;
    }
    
    document.getElementById('time-elapsed').textContent = `${minutes}:${displaySeconds}`;
}

setInterval(updateTimeSpent, 1000);

let recipes = []

async function getRecipes() {
    const response = await fetch("https://raw.githubusercontent.com/chiller33/chiller33.github.io/refs/heads/main/data/recipes.json");
    const data = await response.json();

    recipes = data;

    displayAllRecipes(data);
}

async function getIngredientPrice(ingredient) {
    try {
        // First: autocomplete to get the ID
        const searchRes = await fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?query=${ingredient}&apiKey=bca8a71f99dd41bc930e2ed2f33c85b8`);
        const searchData = await searchRes.json();

        if (!searchData || searchData.length === 0) {
            priceOutput.textContent = "No ingredient found.";
            return;
        }

        const ingredientId = searchData[0].id;

        const infoRes = await fetch(`https://api.spoonacular.com/food/ingredients/${ingredientId}/information?amount=1&unit=piece&apiKey=bca8a71f99dd41bc930e2ed2f33c85b8`);
        const infoData = await infoRes.json();

        if (infoData.estimatedCost) {
            const price = infoData.estimatedCost.value / 100;
            const unit = infoData.estimatedCost.unit || "USD";
            priceOutput.textContent = `Estimated Price: $${price.toFixed(2)} ${unit}`;
        } else {
            priceOutput.textContent = "Price information not available for this ingredient.";
        }

    } catch (error) {
        console.error("Error fetching ingredient price:", error);
        priceOutput.textContent = "Error fetching price.";
    }
}

ingredientInput.addEventListener("input", () => {
    priceOutput.textContent = "";
});

searchButton.addEventListener("click", () => {
    const ingredient = ingredientInput.value.trim();
    if (ingredient) {
        priceOutput.textContent = "Searching...";
        getIngredientPrice(ingredient);
    } else {
        priceOutput.textContent = "Please enter an ingredient.";
    }
});

const displayAllRecipes = (recipesArray) => {
    recipesArray.forEach(recipe => {
        displayRecipe(recipe);
    });
}

async function displayRecipe(recipe) {
    
    const container = document.getElementById("recipe-display");
    
    const card = document.createElement("div");
    card.classList.add("recipe-card");
    
    const titleEl = document.createElement("h2");
    titleEl.textContent = recipe.title;
    
    const imgEl = document.createElement("img");
    imgEl.src = recipe.picture_url;
    imgEl.style.width = "100%";
    
    const descEl = document.createElement("p");
    descEl.textContent = recipe.description;
    
    const listEl = document.createElement("ul");
    
    for (const ingredient of recipe.ingredients) {
        const item = document.createElement("li");
        const amount = ingredient.AMOUNT || "amount not specified";
        item.textContent = `${ingredient.NAME}: ${amount}`;

        listEl.appendChild(item);
    }

    card.appendChild(titleEl);
    card.appendChild(imgEl);
    card.appendChild(descEl);
    card.appendChild(listEl);
    
    container.appendChild(card);
}

getRecipes();

document.getElementById("recipe-form").addEventListener("submit", function (e) {
e.preventDefault();

const title = document.getElementById("recipe-title").value.trim();
const description = document.getElementById("recipe-desc").value.trim();
const imageUrl = document.getElementById("recipe-img").value.trim();

const ingredientNames = document.querySelectorAll(".ingredient-name");
const ingredientAmounts = document.querySelectorAll(".ingredient-amount");

const ingredients = [];

for (let i = 0; i < ingredientNames.length; i++) {
    const name = ingredientNames[i].value.trim();
    const amount = ingredientAmounts[i].value.trim();
    
    if (name && amount) {
        ingredients.push({ NAME: name, AMOUNT: amount });
    }
}

if (ingredients.length < 5) {
    alert("Please enter at least 5 ingredients.");
    return;
}

const newRecipe = {
    id: recipes.length + 1,
    title: title,
    description: description,
    picture_url: imageUrl,
    ingredients: ingredients
}

recipes.push(newRecipe);
displayRecipe(newRecipe);

e.target.reset();
});