// Variables

let balance = Number(localStorage.getItem("blackjackBalance"));

if (!balance) {
    balance = 1000;
}

let bet = 50;

let deck = [];

let playerCards = [];
let dealerCards = [];

let playing = false;
let finished = false;


// Éléments HTML

const balanceElement = document.getElementById("balance");

const betElement = document.getElementById("bet");

const playerCardsElement =
    document.getElementById("player-cards");

const dealerCardsElement =
    document.getElementById("dealer-cards");

const playerScoreElement =
    document.getElementById("player-score");

const dealerScoreElement =
    document.getElementById("dealer-score");

const messageElement =
    document.getElementById("message");

const newGameButton =
    document.getElementById("new-game");

const hitButton =
    document.getElementById("hit");

const standButton =
    document.getElementById("stand");

const plusButton =
    document.getElementById("plus");

const minusButton =
    document.getElementById("minus");

const historyElement =
    document.getElementById("history");


// Cartes

const suits = [
    { symbol: "♠", color: "black" },
    { symbol: "♥", color: "red" },
    { symbol: "♦", color: "red" },
    { symbol: "♣", color: "black" }
];

const values = [
    { name: "2", value: 2 },
    { name: "3", value: 3 },
    { name: "4", value: 4 },
    { name: "5", value: 5 },
    { name: "6", value: 6 },
    { name: "7", value: 7 },
    { name: "8", value: 8 },
    { name: "9", value: 9 },
    { name: "10", value: 10 },
    { name: "J", value: 10 },
    { name: "Q", value: 10 },
    { name: "K", value: 10 },
    { name: "A", value: 11 }
];


// Création du paquet

function createDeck() {

    deck = [];

    for (const suit of suits) {

        for (const value of values) {

            deck.push({
                name: value.name,
                value: value.value,
                suit: suit.symbol,
                color: suit.color
            });
        }
    }

    shuffle();
}


// Mélange

function shuffle() {

    for (let i = deck.length - 1; i > 0; i--) {

        const random =
            Math.floor(Math.random() * (i + 1));

        const temporary = deck[i];

        deck[i] = deck[random];

        deck[random] = temporary;
    }
}


// Tirer une carte

function drawCard() {

    if (deck.length === 0) {
        createDeck();
    }

    return deck.pop();
}


// Calcul du score

function getScore(cards) {

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


// Afficher une carte

function createCard(card, hidden = false) {

    const element =
        document.createElement("div");

    element.classList.add("card");

    if (hidden) {

        element.classList.add("hidden-card");

        return element;
    }

    if (card.color === "red") {
        element.classList.add("red");
    }

    element.innerHTML = `
        <div class="number">${card.name}</div>
        <div class="suit">${card.suit}</div>
        <div class="bottom">${card.name}</div>
    `;

    return element;
}


// Affichage

function render() {

    playerCardsElement.innerHTML = "";
    dealerCardsElement.innerHTML = "";

    for (const card of playerCards) {

        playerCardsElement.appendChild(
            createCard(card)
        );
    }

    for (let i = 0; i < dealerCards.length; i++) {

        const hidden =
            playing &&
            !finished &&
            i === 1;

        dealerCardsElement.appendChild(
            createCard(
                dealerCards[i],
                hidden
            )
        );
    }

    playerScoreElement.textContent =
        getScore(playerCards);

    if (finished) {

        dealerScoreElement.textContent =
            getScore(dealerCards);

    } else {

        dealerScoreElement.textContent = "?";
    }
}


// Solde

function updateBalance() {

    balanceElement.textContent =
        balance.toLocaleString("fr-FR");

    localStorage.setItem(
        "blackjackBalance",
        balance
    );
}


// Mise

function updateBet() {

    betElement.textContent =
        bet.toLocaleString("fr-FR");
}


// Nouvelle partie

function newGame() {

    if (playing) {
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

    playerCards.push(drawCard());
    dealerCards.push(drawCard());

    playerCards.push(drawCard());
    dealerCards.push(drawCard());

    playing = true;
    finished = false;

    hitButton.disabled = false;
    standButton.disabled = false;

    messageElement.textContent =
        "À vous de jouer !";

    render();

    // Blackjack naturel

    if (getScore(playerCards) === 21) {

        finish("blackjack");
    }
}


// Tirer

function hit() {

    if (!playing) {
        return;
    }

    playerCards.push(drawCard());

    render();

    const score =
        getScore(playerCards);

    if (score > 21) {

        finish("loss");

    } else if (score === 21) {

        stand();
    }
}


// Rester

function stand() {

    if (!playing) {
        return;
    }

    while (getScore(dealerCards) < 17) {

        dealerCards.push(drawCard());
    }

    render();

    const playerScore =
        getScore(playerCards);

    const dealerScore =
        getScore(dealerCards);

    if (dealerScore > 21) {

        finish("win");

    } else if (playerScore > dealerScore) {

        finish("win");

    } else if (playerScore < dealerScore) {

        finish("loss");

    } else {

        finish("draw");
    }
}


// Fin de partie

function finish(result) {

    playing = false;
    finished = true;

    hitButton.disabled = true;
    standButton.disabled = true;

    let message = "";
    let amount = 0;

    if (result === "blackjack") {

        amount = Math.floor(bet * 2.5);

        balance += amount;

        message =
            "🎉 BLACKJACK ! +" +
            amount +
            " jetons";

        addHistory(
            "Blackjack",
            "+" + amount,
            "win"
        );

    } else if (result === "win") {

        amount = bet * 2;

        balance += amount;

        message =
            "🎉 VOUS GAGNEZ ! +" +
            amount +
            " jetons";

        addHistory(
            "Victoire",
            "+" + amount,
            "win"
        );

    } else if (result === "loss") {

        message =
            "💀 Vous perdez la mise.";

        addHistory(
            "Défaite",
            "-" + bet,
            "loss"
        );

    } else {

        balance += bet;

        message =
            "🤝 Égalité ! Votre mise est rendue.";

        addHistory(
            "Égalité",
            "0",
            ""
        );
    }

    messageElement.textContent = message;

    updateBalance();

    render();
}


// Historique

function addHistory(name, amount, type) {

    if (
        historyElement.textContent.trim()
        === "Aucune partie pour le moment."
    ) {
        historyElement.innerHTML = "";
    }

    const item =
        document.createElement("div");

    item.classList.add("history-item");

    if (type) {
        item.classList.add(type);
    }

    item.innerHTML = `
        <span>${name}</span>
        <strong>${amount} 🪙</strong>
    `;

    historyElement.prepend(item);
}


// Augmenter la mise

plusButton.addEventListener("click", function () {

    if (playing) {
        return;
    }

    if (bet < 500) {

        bet += 25;

        updateBet();
    }
});


// Diminuer la mise

minusButton.addEventListener("click", function () {

    if (playing) {
        return;
    }

    if (bet > 25) {

        bet -= 25;

        updateBet();
    }
});


// Boutons

newGameButton.addEventListener(
    "click",
    newGame
);

hitButton.addEventListener(
    "click",
    hit
);

standButton.addEventListener(
    "click",
    stand
);


// Initialisation

updateBalance();
updateBet();
render();
