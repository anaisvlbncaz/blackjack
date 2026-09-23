// Variables

let balance = Number(localStorage.getItem("blackjackBalance"));

if (!balance) {
    balance = 1000;
}

let bet = 50;

let deck = [];

let dealerCards = [];

let hands = [];

let currentHand = 0;

let playing = false;
let finished = false;

let insuranceBet = 0;
let insuranceAvailable = false;


// Éléments HTML

const balanceElement = document.getElementById("balance");

const betElement = document.getElementById("bet");

const playerHandsElement =
    document.getElementById("player-hands");

const dealerCardsElement =
    document.getElementById("dealer-cards");

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

const doubleButton =
    document.getElementById("double");

const splitButton =
    document.getElementById("split");

const insuranceButton =
    document.getElementById("insurance");

const surrenderButton =
    document.getElementById("surrender");

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

        [deck[i], deck[random]] =
            [deck[random], deck[i]];
    }
}


// Tirer une carte

function drawCard() {

    if (deck.length === 0) {
        createDeck();
    }

    return deck.pop();
}


// Score

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


// Blackjack naturel

function isBlackjack(cards) {

    return cards.length === 2 &&
           getScore(cards) === 21;
}


// Même valeur pour split

function canSplit(hand) {

    if (hand.cards.length !== 2) {
        return false;
    }

    return hand.cards[0].value === hand.cards[1].value;
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


// Affichage du croupier

function renderDealer() {

    dealerCardsElement.innerHTML = "";

    dealerCards.forEach((card, index) => {

        const hidden =
            playing &&
            !finished &&
            index === 1;

        dealerCardsElement.appendChild(
            createCard(card, hidden)
        );

    });

    if (finished) {

        dealerScoreElement.textContent =
            getScore(dealerCards);

    } else {

        if (dealerCards.length > 0) {

            dealerScoreElement.textContent =
                getScore([dealerCards[0]]);

        } else {

            dealerScoreElement.textContent = "?";
        }
    }
}


// Affichage des joueurs

function renderPlayers() {

    playerHandsElement.innerHTML = "";

    hands.forEach((hand, index) => {

        const handElement =
            document.createElement("div");

        handElement.classList.add("player-hand");

        if (index === currentHand && playing) {
            handElement.classList.add("active-hand");
        }

        const title =
            document.createElement("div");

        title.classList.add("hand-title");

        title.innerHTML = `
            MAIN ${index + 1}
            <span>
                Mise : ${hand.bet} 🪙
            </span>
        `;

        handElement.appendChild(title);

        const cards =
            document.createElement("div");

        cards.classList.add("cards");

        hand.cards.forEach(card => {

            cards.appendChild(
                createCard(card)
            );

        });

        handElement.appendChild(cards);

        const score =
            document.createElement("div");

        score.classList.add("score");

        score.innerHTML =
            `Score : <span>${getScore(hand.cards)}</span>`;

        handElement.appendChild(score);

        playerHandsElement.appendChild(handElement);

    });
}


// Affichage général

function render() {

    renderDealer();
    renderPlayers();

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


// Boutons

function updateButtons() {

    hitButton.disabled = true;
    standButton.disabled = true;
    doubleButton.disabled = true;
    splitButton.disabled = true;
    insuranceButton.disabled = true;
    surrenderButton.disabled = true;

    if (!playing || finished) {
        return;
    }

    const hand = hands[currentHand];

    if (!hand) {
        return;
    }

    hitButton.disabled = false;
    standButton.disabled = false;

    // Double uniquement sur les 2 premières cartes

    if (
        hand.cards.length === 2 &&
        balance >= hand.bet &&
        !hand.doubled &&
        !hand.splitAces
    ) {

        doubleButton.disabled = false;
    }

    // Split

    if (
        hands.length < 4 &&
        canSplit(hand) &&
        balance >= hand.bet
    ) {

        splitButton.disabled = false;
    }

    // Abandon uniquement sur les 2 premières cartes

    if (
        hand.cards.length === 2 &&
        !hand.doubled &&
        !hand.splitAces
    ) {

        surrenderButton.disabled = false;
    }

    // Assurance

    if (
        insuranceAvailable &&
        insuranceBet === 0 &&
        balance >= Math.floor(hand.bet / 2)
    ) {

        insuranceButton.disabled = false;
    }

}


// Nouvelle partie

async function newGame() {

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

    dealerCards = [];

    hands = [
        {
            cards: [],
            bet: bet,
            doubled: false,
            stood: false,
            busted: false,
            surrendered: false,
            splitAces: false
        }
    ];

    currentHand = 0;

    insuranceBet = 0;

    insuranceAvailable = false;

    playing = true;
    finished = false;

    messageElement.textContent =
        "Distribution...";

    render();

    updateButtons();

    // Première carte joueur

    await dealToPlayer(0);

    // Première carte croupier

    await dealToDealer();

    // Deuxième carte joueur

    await dealToPlayer(0);

    // Deuxième carte croupier

    await dealToDealer();

    // Assurance si As visible

    if (dealerCards[0].name === "A") {

        insuranceAvailable = true;

        messageElement.textContent =
            "Le croupier montre un As : assurance ?";

        updateButtons();

        return;
    }

    await afterInitialDeal();

}


// Après distribution

async function afterInitialDeal() {

    const hand = hands[0];

    // Blackjack joueur

    if (isBlackjack(hand.cards)) {

        if (isBlackjack(dealerCards)) {

            finishAll("draw");

        } else {

            finishAll("blackjack");
        }

        return;
    }

    // Blackjack croupier

    if (isBlackjack(dealerCards)) {

        finishAll("dealer-blackjack");

        return;
    }

    messageElement.textContent =
        "À vous de jouer !";

    updateButtons();

    render();

}


// Distribution joueur

function dealToPlayer(handIndex) {

    return new Promise(resolve => {

        setTimeout(() => {

            const card = drawCard();

            hands[handIndex].cards.push(card);

            render();

            resolve();

        }, 450);

    });
}


// Distribution croupier

function dealToDealer() {

    return new Promise(resolve => {

        setTimeout(() => {

            dealerCards.push(drawCard());

            render();

            resolve();

        }, 450);

    });
}


// Tirer

async function hit() {

    if (!playing) {
        return;
    }

    const hand = hands[currentHand];

    if (!hand) {
        return;
    }

    insuranceAvailable = false;

    await dealToPlayer(currentHand);

    const score =
        getScore(hand.cards);

    if (score > 21) {

        hand.busted = true;

        messageElement.textContent =
            `Main ${currentHand + 1} : dépassé 21 !`;

        await nextHand();

    } else if (score === 21) {

        await stand();

    } else {

        messageElement.textContent =
            `Main ${currentHand + 1} : à vous de jouer`;

        updateButtons();
    }
}


// Rester

async function stand() {

    if (!playing) {
        return;
    }

    const hand = hands[currentHand];

    hand.stood = true;

    await nextHand();

}


// Passer à la main suivante

async function nextHand() {

    updateButtons();

    if (currentHand < hands.length - 1) {

        currentHand++;

        const next = hands[currentHand];

        messageElement.textContent =
            `À la main ${currentHand + 1}`;

        render();

        updateButtons();

        // Split d'As : une seule carte puis stand

        if (next.splitAces) {

            await dealToPlayer(currentHand);

            next.stood = true;

            await nextHand();

            return;
        }

        return;
    }

    await dealerTurn();

}


// Tour du croupier

async function dealerTurn() {

    playing = true;

    insuranceAvailable = false;

    updateButtons();

    messageElement.textContent =
        "Le croupier joue...";

    render();

    await sleep(500);

    while (getScore(dealerCards) < 17) {

        dealerCards.push(drawCard());

        render();

        await sleep(700);
    }

    finishAll("compare");

}


// Comparaison finale

function finishAll(result) {

    playing = false;
    finished = true;

    updateButtons();

    render();

    let totalChange = 0;

    // Assurance

    if (insuranceBet > 0) {

        if (isBlackjack(dealerCards)) {

            const insuranceWin =
                insuranceBet * 3;

            balance += insuranceWin;

            totalChange += insuranceWin;

        }
    }

    // Blackjack naturel

    if (result === "blackjack") {

        const hand = hands[0];

        const gain =
            Math.floor(hand.bet * 2.5);

        balance += gain;

        totalChange += gain;

        messageElement.textContent =
            `🎉 BLACKJACK ! +${gain} jetons`;

        addHistory(
            "Blackjack",
            "+" + gain,
            "win"
        );

        updateBalance();

        return;
    }

    // Blackjack du croupier

    if (result === "dealer-blackjack") {

        messageElement.textContent =
            "💀 Blackjack du croupier.";

        addHistory(
            "Blackjack croupier",
            "-" + getTotalBets(),
            "loss"
        );

        updateBalance();

        return;
    }

    // Égalité initiale

    if (result === "draw") {

        const hand = hands[0];

        balance += hand.bet;

        messageElement.textContent =
            "🤝 Blackjack des deux côtés : égalité.";

        addHistory(
            "Égalité",
            "0",
            ""
        );

        updateBalance();

        return;
    }

    // Comparaison de toutes les mains

    let wins = 0;
    let losses = 0;
    let draws = 0;

    for (const hand of hands) {

        if (hand.surrendered) {

            balance += hand.bet / 2;

            losses++;

            continue;
        }

        const playerScore =
            getScore(hand.cards);

        const dealerScore =
            getScore(dealerCards);

        if (playerScore > 21) {

            losses++;

        } else if (dealerScore > 21) {

            balance += hand.bet * 2;

            wins++;

        } else if (playerScore > dealerScore) {

            balance += hand.bet * 2;

            wins++;

        } else if (playerScore < dealerScore) {

            losses++;

        } else {

            balance += hand.bet;

            draws++;
        }
    }

    let message = "";

    if (wins > 0 && losses === 0) {

        message =
            `🎉 Vous gagnez ${wins} main${wins > 1 ? "s" : ""} !`;

    } else if (losses > 0 && wins === 0) {

        message =
            `💀 Vous perdez ${losses} main${losses > 1 ? "s" : ""}.`;

    } else {

        message =
            `Résultat : ${wins} victoire(s), ${losses} défaite(s), ${draws} égalité(s).`;
    }

    messageElement.textContent = message;

    addHistory(
        "Partie terminée",
        wins > losses ? "Gain" : "Résultat",
        wins > losses ? "win" : ""
    );

    updateBalance();
}


// Doubler

async function doubleDown() {

    if (!playing) {
        return;
    }

    const hand = hands[currentHand];

    if (
        hand.cards.length !== 2 ||
        balance < hand.bet ||
        hand.doubled
    ) {

        return;
    }

    balance -= hand.bet;

    hand.bet *= 2;
    hand.doubled = true;

    updateBalance();

    messageElement.textContent =
        "Mise doublée !";

    updateButtons();

    await dealToPlayer(currentHand);

    const score =
        getScore(hand.cards);

    if (score > 21) {

        hand.busted = true;

        await nextHand();

    } else {

        await stand();
    }
}


// Split

async function splitHand() {

    if (!playing) {
        return;
    }

    const hand = hands[currentHand];

    if (!canSplit(hand)) {
        return;
    }

    if (balance < hand.bet) {
        return;
    }

    // Payer la deuxième mise

    balance -= hand.bet;

    const firstCard =
        hand.cards[0];

    const secondCard =
        hand.cards[1];

    hand.cards = [firstCard];

    hand.splitAces =
        firstCard.name === "A";

    const newHand = {
        cards: [secondCard],
        bet: hand.bet,
        doubled: false,
        stood: false,
        busted: false,
        surrendered: false,
        splitAces: secondCard.name === "A"
    };

    hands.splice(
        currentHand + 1,
        0,
        newHand
    );

    updateBalance();

    render();

    messageElement.textContent =
        "Split !";

    await sleep(400);

    // Première main

    await dealToPlayer(currentHand);

    // Deuxième main

    await dealToPlayer(currentHand + 1);

    // Split des As

    if (hand.splitAces) {

        hand.stood = true;

    }

    if (newHand.splitAces) {

        newHand.stood = true;

    }

    render();

    updateButtons();

    // Si As split, on passe automatiquement

    if (hand.splitAces) {

        currentHand++;

        if (newHand.splitAces) {

            await dealToPlayer(currentHand);

            await nextHand();

        }

    }
}


// Assurance

function takeInsurance() {

    if (!insuranceAvailable) {
        return;
    }

    const amount =
        Math.floor(hands[currentHand].bet / 2);

    if (balance < amount) {
        return;
    }

    balance -= amount;

    insuranceBet = amount;

    insuranceAvailable = false;

    updateBalance();

    messageElement.textContent =
        `Assurance prise : ${amount} 🪙`;

    updateButtons();

    // Vérification immédiate du blackjack

    if (isBlackjack(dealerCards)) {

        finishAll("dealer-blackjack");

    } else {

        afterInitialDeal();
    }
}


// Abandon

function surrender() {

    if (!playing) {
        return;
    }

    const hand = hands[currentHand];

    if (
        hand.cards.length !== 2 ||
        hand.doubled ||
        hand.splitAces
    ) {

        return;
    }

    hand.surrendered = true;

    messageElement.textContent =
        "🏳️ Main abandonnée : moitié de la mise rendue.";

    nextHand();
}


// Pause

function sleep(ms) {

    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );
}


// Total des mises

function getTotalBets() {

    return hands.reduce(
        (total, hand) => total + hand.bet,
        0
    );
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


// Mise +

plusButton.addEventListener(
    "click",
    function () {

        if (playing) {
            return;
        }

        if (bet < 500) {

            bet += 25;

            updateBet();
        }
    }
);


// Mise -

minusButton.addEventListener(
    "click",
    function () {

        if (playing) {
            return;
        }

        if (bet > 25) {

            bet -= 25;

            updateBet();
        }
    }
);


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

doubleButton.addEventListener(
    "click",
    doubleDown
);

splitButton.addEventListener(
    "click",
    splitHand
);

insuranceButton.addEventListener(
    "click",
    takeInsurance
);

surrenderButton.addEventListener(
    "click",
    surrender
);


// Initialisation

updateBalance();

updateBet();

render();

updateButtons();
