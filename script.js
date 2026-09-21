### Variables ###

let balance = Number(localStorage.getItem("blackjackBalance")) || 1000;

let bet = 50;

let deck = [];

let playerCards = [];
let dealerCards = [];

let gameStarted = false;
let gameOver = false;

### Éléments HTML ###

const balanceElement = document.getElementById("balance");

const betElement = document.getElementById("bet");

const playerCardsElement = document.getElementById("player-cards");
const dealerCardsElement = document.getElementById("dealer-cards");

const playerScoreElement = document.getElementById("player-score");
const dealerScoreElement = document.getElementById("dealer-score");

const messageElement = document.getElementById("game-message");

const startButton = document.getElementById("start-button");
const hitButton = document.getElementById("hit-button");
const standButton = document.getElementById("stand-button");

const plusBetButton = document.getElementById("plus-bet");
const minusBetButton = document.getElementById("minus-bet");

const historyList = document.getElementById("history-list");

### Cartes ###

const suits = [
    {
        symbol: "♠",
        name: "spades",
        color: "black"
    },
    {
        symbol: "♥",
        name: "hearts",
        color: "red"
    },
    {
        symbol: "♦",
        name: "diamonds",
        color: "red"
    },
    {
        symbol: "♣",
        name: "clubs",
        color: "black"
    }
];

const values = [
    {
        name: "2",
        value: 2
    },
    {
        name: "3",
        value: 3
    },
    {
        name: "4",
        value: 4
    },
    {
        name: "5",
        value: 5
    },
    {
        name: "6",
        value: 6
    },
    {
        name: "7",
        value: 7
    },
    {
        name: "8",
        value: 8
    },
    {
        name: "9",
        value: 9
    },
    {
        name: "10",
        value: 10
    },
    {
        name: "J",
        value: 10
    },
    {
        name: "Q",
        value: 10
    },
    {
        name: "K",
        value: 10
    },
    {
        name: "A",
        value: 11
    }
];

### Créer le paquet ###

function createDeck() {

    deck = [];

    for (const suit of suits) {

        for (const value of values) {

            deck.push({
                suit: suit.symbol,
                color: suit.color,
                name: value.name,
                value: value.value
            });

        }

    }

    shuffleDeck();
}

### Mélanger le paquet ###

function shuffleDeck() {

    for (let i = deck.length - 1; i > 0; i--) {

        const randomIndex = Math.floor(Math.random() * (i + 1));

        const temporary = deck[i];

        deck[i] = deck[randomIndex];

        deck[randomIndex] = temporary;
    }
}

### Piocher une carte ###

function drawCard() {

    if (deck.length === 0) {
        createDeck();
    }

    return deck.pop();
}

### Calculer le score ###

function calculateScore(cards) {

    let score = 0;

    let aces = 0;

    for (const card of cards) {

        score += card.value;

        if (card.name === "A") {
            aces++;
        }
    }

    while (score > 21 && aces > 0) {

        score -= 10;

        aces--;
    }

    return score;
}

### Afficher une carte ###

function createCardElement(card, hidden = false) {

    const cardElement = document.createElement("div");

    cardElement.classList.add("card");

    if (card.color === "red") {
        cardElement.classList.add("red");
    }

    if (hidden) {

        cardElement.classList.add("hidden");

        cardElement.innerHTML = "";

        return cardElement;
    }

    cardElement.innerHTML = `
        <div class="card-value">${card.name}</div>
        <div class="card-suit">${card.suit}</div>
        <div class="card-bottom">${card.name}</div>
    `;

    return cardElement;
}

### Afficher les cartes ###

function renderCards() {

    playerCardsElement.innerHTML = "";
    dealerCardsElement.innerHTML = "";

    for (const card of playerCards) {

        playerCardsElement.appendChild(
            createCardElement(card)
        );

    }

    for (let i = 0; i < dealerCards.length; i++) {

        const hidden =
            gameStarted &&
            !gameOver &&
            i === 1;

        dealerCardsElement.appendChild(
            createCardElement(
                dealerCards[i],
                hidden
            )
        );
    }

    playerScoreElement.textContent =
        calculateScore(playerCards);

    if (gameOver) {

        dealerScoreElement.textContent =
            calculateScore(dealerCards);

    } else {

        dealerScoreElement.textContent =
            "?";
    }
}

### Mettre à jour le solde ###

function updateBalance() {

    balanceElement.textContent =
        balance.toLocaleString("fr-FR");

    localStorage.setItem(
        "blackjackBalance",
        balance
    );
}

### Mettre à jour la mise ###

function updateBet() {

    betElement.textContent =
        bet.toLocaleString("fr-FR");
}

### Nouvelle partie ###

function startGame() {

    if (gameStarted && !gameOver) {
        return;
    }

    if (balance < bet) {

        messageElement.textContent =
            "Vous n'avez pas assez de jetons.";

        return;
    }

    balance -= bet;

    updateBalance();

    createDeck();

    playerCards = [];
    dealerCards = [];

    gameStarted = true;
    gameOver = false;

    playerCards.push(drawCard());
    dealerCards.push(drawCard());

    playerCards.push(drawCard());
    dealerCards.push(drawCard());

    messageElement.textContent =
        "À vous de jouer.";

    hitButton.disabled = false;
    standButton.disabled = false;

    renderCards();

    ### Vérification du Blackjack ###

    const playerScore =
        calculateScore(playerCards);

    if (playerScore === 21) {

        finishGame("blackjack");
    }
}

### Tirer ###

function hit() {

    if (!gameStarted || gameOver) {
        return;
    }

    playerCards.push(drawCard());

    renderCards();

    const score =
        calculateScore(playerCards);

    if (score > 21) {

        finishGame("bust");

    } else if (score === 21) {

        stand();
    }
}

### Rester ###

function stand() {

    if (!gameStarted || gameOver) {
        return;
    }

    messageElement.textContent =
        "Le croupier joue...";

    while (calculateScore(dealerCards) < 17) {

        dealerCards.push(drawCard());
    }

    renderCards();

    determineWinner();
}

### Déterminer le gagnant ###

function determineWinner() {

    const playerScore =
        calculateScore(playerCards);

    const dealerScore =
        calculateScore(dealerCards);

    if (dealerScore > 21) {

        finishGame("dealer-bust");

    } else if (playerScore > dealerScore) {

        finishGame("win");

    } else if (playerScore < dealerScore) {

        finishGame("loss");

    } else {

        finishGame("draw");
    }
}

### Fin de partie ###

function finishGame(result) {

    gameOver = true;
    gameStarted = false;

    hitButton.disabled = true;
    standButton.disabled = true;

    let message = "";
    let reward = 0;

    switch (result) {

        case "blackjack":

            reward = bet * 2.5;

            balance += Math.floor(reward);

            message =
                `BLACKJACK ! Vous gagnez ${Math.floor(reward)} jetons.`;

            addHistory(
                "Blackjack",
                `+${Math.floor(reward)} 🪙`,
                "win"
            );

            break;

        case "win":

            reward = bet * 2;

            balance += reward;

            message =
                `Vous gagnez ! +${reward} jetons.`;

            addHistory(
                "Victoire",
                `+${reward} 🪙`,
                "win"
            );

            break;

        case "dealer-bust":

            reward = bet * 2;

            balance += reward;

            message =
                `Le croupier dépasse 21 ! +${reward} jetons.`;

            addHistory(
                "Croupier dépassé",
                `+${reward} 🪙`,
                "win"
            );

            break;

        case "loss":

            message =
                "Le croupier gagne.";

            addHistory(
                "Défaite",
                `-${bet} 🪙`,
                "loss"
            );

            break;

        case "bust":

            message =
                "Vous avez dépassé 21.";

            addHistory(
                "Bust",
                `-${bet} 🪙`,
                "loss"
            );

            break;

        case "draw":

            balance += bet;

            message =
                "Égalité ! Votre mise est rendue.";

            addHistory(
                "Égalité",
                `+${bet} 🪙`,
                ""
            );

            break;
    }

    messageElement.textContent = message;

    updateBalance();

    renderCards();

    if (balance <= 0) {

        messageElement.textContent +=
            " Vous n'avez plus de jetons.";
    }
}

### Historique ###

function addHistory(name, amount, type) {

    if (
        historyList.children.length === 1 &&
        historyList.children[0].textContent === "Aucune partie jouée"
    ) {

        historyList.innerHTML = "";
    }

    const item =
        document.createElement("div");

    item.classList.add(
        "history-item"
    );

    if (type) {
        item.classList.add(type);
    }

    item.innerHTML = `
        <span>${name}</span>
        <strong>${amount}</strong>
    `;

    historyList.prepend(item);

    if (historyList.children.length > 5) {

        historyList.removeChild(
            historyList.lastChild
        );
    }
}

### Bouton + mise ###

plusBetButton.addEventListener(
    "click",
    () => {

        if (bet < 500) {

            bet += 25;

            updateBet();
        }
    }
);

### Bouton - mise ###

minusBetButton.addEventListener(
    "click",
    () => {

        if (bet > 25) {

            bet -= 25;

            updateBet();
        }
    }
);

### Nouvelle partie ###

startButton.addEventListener(
    "click",
    startGame
);

### Tirer ###

hitButton.addEventListener(
    "click",
    hit
);

### Rester ###

standButton.addEventListener(
    "click",
    stand
);

### Initialisation ###

updateBalance();
updateBet();
renderCards();
