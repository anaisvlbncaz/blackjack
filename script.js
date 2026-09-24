// ==============================
// BLACKJACK ROYALE
// ==============================

// ==============================
// VARIABLES
// ==============================

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
let insuranceTaken = false;

let dealerHoleCardDealt = false;


// ==============================
// SABOT
// ==============================

const NUMBER_OF_DECKS = 6;
const TOTAL_CARDS = NUMBER_OF_DECKS * 52;

// Le sabot est renouvelé après 75 % de cartes utilisées
const PENETRATION = 0.75;


// ==============================
// ELEMENTS HTML
// ==============================

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


// ==============================
// CARTES
// ==============================

const suits = [
    {
        symbol: "♠",
        color: "black"
    },
    {
        symbol: "♥",
        color: "red"
    },
    {
        symbol: "♦",
        color: "red"
    },
    {
        symbol: "♣",
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


// ==============================
// CREATION DU SABOT
// ==============================

function createDeck() {

    deck = [];

    for (let d = 0; d < NUMBER_OF_DECKS; d++) {

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

    }

    shuffle();

}


// ==============================
// MELANGE
// ==============================

function shuffle() {

    for (let i = deck.length - 1; i > 0; i--) {

        const j =
            Math.floor(Math.random() * (i + 1));

        [
            deck[i],
            deck[j]
        ] = [
            deck[j],
            deck[i]
        ];

    }

}


// ==============================
// TIRAGE
// ==============================

function drawCard() {

    if (deck.length === 0) {

        createDeck();

    }

    return deck.pop();

}


// ==============================
// VERIFICATION DU SABOT
// ==============================

function checkShoe() {

    const cardsUsed =
        TOTAL_CARDS - deck.length;

    const penetration =
        cardsUsed / TOTAL_CARDS;

    if (penetration >= PENETRATION) {

        createDeck();

        addHistory(
            "Nouveau sabot de 6 jeux"
        );

    }

}


// ==============================
// SCORE
// ==============================

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


// ==============================
// BLACKJACK
// ==============================

function isBlackjack(cards) {

    return (
        cards.length === 2 &&
        getScore(cards) === 21
    );

}


// ==============================
// SPLIT
// ==============================

function canSplit(hand) {

    if (!hand) {
        return false;
    }

    if (hand.cards.length !== 2) {
        return false;
    }

    return (
        hand.cards[0].value ===
        hand.cards[1].value
    );

}


// ==============================
// CREATION CARTE HTML
// ==============================

function createCard(card) {

    const cardElement =
        document.createElement("div");

    cardElement.className = "card";

    if (card.color === "red") {

        cardElement.classList.add("red");

    }

    cardElement.innerHTML = `
        <div class="card-value top">
            ${card.name} ${card.suit}
        </div>

        <div class="card-suit">
            ${card.suit}
        </div>

        <div class="card-value bottom">
            ${card.name} ${card.suit}
        </div>
    `;

    return cardElement;

}


// ==============================
// AFFICHAGE CROUPIER
// ==============================

function renderDealer() {

    dealerCardsElement.innerHTML = "";

    for (const card of dealerCards) {

        dealerCardsElement.appendChild(
            createCard(card)
        );

    }

    if (dealerCards.length === 0) {

        dealerScoreElement.textContent = "-";

        return;

    }

    dealerScoreElement.textContent =
        getScore(dealerCards);

}


// ==============================
// AFFICHAGE JOUEUR
// ==============================

function renderPlayers() {

    playerHandsElement.innerHTML = "";

    hands.forEach((hand, index) => {

        const handElement =
            document.createElement("div");

        handElement.className =
            "player-hand";

        if (
            index === currentHand &&
            playing
        ) {

            handElement.classList.add(
                "active-hand"
            );

        }

        if (hand.finished) {

            handElement.classList.add(
                "finished-hand"
            );

        }


        // Titre

        const title =
            document.createElement("div");

        title.className =
            "hand-title";

        title.textContent =
            hands.length > 1
                ? `Main ${index + 1}`
                : "Votre main";

        handElement.appendChild(title);


        // Cartes

        const cardsElement =
            document.createElement("div");

        cardsElement.className =
            "hand-cards";

        for (const card of hand.cards) {

            cardsElement.appendChild(
                createCard(card)
            );

        }

        handElement.appendChild(
            cardsElement
        );


        // Score

        const scoreElement =
            document.createElement("div");

        scoreElement.className =
            "hand-score";

        scoreElement.textContent =
            `Score : ${getScore(hand.cards)}`;

        handElement.appendChild(
            scoreElement
        );


        // Mise

        const handBetElement =
            document.createElement("div");

        handBetElement.className =
            "hand-bet";

        handBetElement.textContent =
            `Mise : ${hand.bet} €`;

        handElement.appendChild(
            handBetElement
        );


        playerHandsElement.appendChild(
            handElement
        );

    });

}


// ==============================
// AFFICHAGE GLOBAL
// ==============================

function render() {

    renderDealer();

    renderPlayers();

    updateBalance();

    updateBet();

    updateButtons();

}


// ==============================
// SOLDE
// ==============================

function updateBalance() {

    balanceElement.textContent =
        `${balance.toFixed(2)} €`;

    localStorage.setItem(
        "blackjackBalance",
        balance
    );

}


// ==============================
// MISE
// ==============================

function updateBet() {

    betElement.textContent =
        `${bet} €`;

}


// ==============================
// BOUTONS
// ==============================

function updateButtons() {

    const hand =
        hands[currentHand];


    if (
        !playing ||
        !hand ||
        hand.finished
    ) {

        hitButton.disabled = true;
        standButton.disabled = true;
        doubleButton.disabled = true;
        splitButton.disabled = true;
        surrenderButton.disabled = true;

        return;

    }


    hitButton.disabled = false;

    standButton.disabled = false;


    // Double

    doubleButton.disabled =
        hand.cards.length !== 2 ||
        balance < hand.bet;


    // Split

    splitButton.disabled =
        !canSplit(hand) ||
        balance < hand.bet;


    // Surrender

    surrenderButton.disabled =
        hand.cards.length !== 2;

}


// ==============================
// NOUVELLE PARTIE
// ==============================

async function newGame() {

    if (playing) {
        return;
    }


    if (bet <= 0) {

        messageElement.textContent =
            "Veuillez choisir une mise.";

        return;

    }


    if (balance < bet) {

        messageElement.textContent =
            "Solde insuffisant.";

        return;

    }


    // Vérification du sabot

    checkShoe();


    // Reset

    dealerCards = [];

    hands = [];

    currentHand = 0;

    playing = true;

    finished = false;

    insuranceBet = 0;

    insuranceAvailable = false;

    insuranceTaken = false;

    dealerHoleCardDealt = false;


    // Retrait de la mise

    balance -= bet;


    // Création main joueur

    hands.push({

        cards: [],

        bet: bet,

        finished: false,

        doubled: false,

        splitAces: false,

        surrendered: false

    });


    render();


    messageElement.textContent =
        "Distribution...";


    // ==============================
    // ORDRE DE DISTRIBUTION
    // ==============================

    // Joueur 1

    await dealToPlayer();

    // Croupier 1

    await dealToDealer();

    // Joueur 2

    await dealToPlayer();


    render();

    await sleep(400);


    await afterInitialDeal();

}


// ==============================
// FIN DISTRIBUTION INITIALE
// ==============================

async function afterInitialDeal() {

    const hand = hands[0];


    // Blackjack naturel joueur

    if (isBlackjack(hand.cards)) {

        messageElement.textContent =
            "Blackjack !";

        await dealerTurn();

        return;

    }


    // Assurance

    if (
        dealerCards.length > 0 &&
        dealerCards[0].name === "A"
    ) {

        insuranceAvailable = true;

        messageElement.textContent =
            "Assurance disponible.";

    } else {

        messageElement.textContent =
            "À vous de jouer.";

    }


    render();

}


// ==============================
// DISTRIBUER JOUEUR
// ==============================

async function dealToPlayer(
    handIndex = currentHand
) {

    const card = drawCard();

    hands[handIndex].cards.push(card);

    render();

    await sleep(400);

}


// ==============================
// DISTRIBUER CROUPIER
// ==============================

async function dealToDealer() {

    const card = drawCard();

    dealerCards.push(card);

    render();

    await sleep(450);

}


// ==============================
// HIT
// ==============================

async function hit() {

    if (!playing) {
        return;
    }


    const hand =
        hands[currentHand];


    if (!hand || hand.finished) {
        return;
    }


    insuranceAvailable = false;


    await dealToPlayer();


    const score =
        getScore(hand.cards);


    // Bust

    if (score > 21) {

        hand.finished = true;

        messageElement.textContent =
            "Vous avez dépassé 21.";

        render();

        await sleep(600);

        await nextHand();

        return;

    }


    // 21

    if (score === 21) {

        hand.finished = true;

        messageElement.textContent =
            "21 !";

        render();

        await sleep(600);

        await nextHand();

        return;

    }


    messageElement.textContent =
        "À vous de jouer.";

    render();

}


// ==============================
// STAND
// ==============================

async function stand() {

    if (!playing) {
        return;
    }


    const hand =
        hands[currentHand];


    if (!hand || hand.finished) {
        return;
    }


    hand.finished = true;

    insuranceAvailable = false;


    messageElement.textContent =
        "Main terminée.";


    render();

    await sleep(500);

    await nextHand();

}


// ==============================
// MAIN SUIVANTE
// ==============================

async function nextHand() {

    for (
        let i = 0;
        i < hands.length;
        i++
    ) {

        if (!hands[i].finished) {

            currentHand = i;

            messageElement.textContent =
                `Main ${i + 1}. À vous de jouer.`;

            render();

            return;

        }

    }


    // Toutes les mains sont terminées

    await dealerTurn();

}


// ==============================
// TOUR DU CROUPIER
// ==============================

async function dealerTurn() {

    playing = false;

    insuranceAvailable = false;


    messageElement.textContent =
        "Le croupier joue...";


    render();

    await sleep(600);


    // ==============================
    // DEUXIEME CARTE CROUPIER
    // ==============================

    if (!dealerHoleCardDealt) {

        messageElement.textContent =
            "Le croupier retourne sa carte...";

        await dealToDealer();

        dealerHoleCardDealt = true;

        render();

        await sleep(700);

    }


    // ==============================
    // BLACKJACK CROUPIER
    // ==============================

    const dealerBlackjack =
        isBlackjack(dealerCards);


    // Assurance

    if (insuranceTaken) {

        if (dealerBlackjack) {

            const insuranceReturn =
                insuranceBet * 3;

            balance += insuranceReturn;

            addHistory(
                `Assurance gagnante : mise ${insuranceBet} € → retour ${insuranceReturn} € → gain net +${insuranceBet * 2} €`
            );

        } else {

            addHistory(
                `Assurance perdue : mise ${insuranceBet} € → retour 0 €`
            );

        }

        insuranceBet = 0;

        insuranceTaken = false;

    }


    // ==============================
    // BLACKJACK CROUPIER
    // ==============================

    if (dealerBlackjack) {

        messageElement.textContent =
            "Blackjack du croupier.";

        for (const hand of hands) {

            const playerBlackjack =
                isBlackjack(hand.cards);


            if (playerBlackjack) {

                balance += hand.bet;

                addHistory(
                    `Blackjack contre blackjack : mise ${hand.bet} € → retour ${hand.bet} € → gain net 0 €`
                );

            } else {

                addHistory(
                    `Défaite : mise ${hand.bet} € → retour 0 €`
                );

            }

        }


        finished = true;

        playing = false;

        render();

        return;

    }


    // ==============================
    // TOUR DU CROUPIER
    // ==============================

    while (
        getScore(dealerCards) < 17
    ) {

        await dealToDealer();

    }


    render();

    await sleep(700);


    // ==============================
    // RESULTATS
    // ==============================

    finishAll();

}


// ==============================
// DOUBLE
// ==============================

async function doubleDown() {

    if (!playing) {
        return;
    }


    const hand =
        hands[currentHand];


    if (!hand || hand.finished) {
        return;
    }


    if (hand.cards.length !== 2) {
        return;
    }


    if (balance < hand.bet) {

        messageElement.textContent =
            "Solde insuffisant pour doubler.";

        return;

    }


    // Deuxième mise

    balance -= hand.bet;

    hand.bet *= 2;

    hand.doubled = true;

    insuranceAvailable = false;


    // Une seule carte

    await dealToPlayer();


    const score =
        getScore(hand.cards);


    if (score > 21) {

        hand.finished = true;

        messageElement.textContent =
            "Double perdu.";

    } else {

        hand.finished = true;

        messageElement.textContent =
            "Double terminé.";

    }


    render();

    await sleep(600);

    await nextHand();

}


// ==============================
// SPLIT
// ==============================

async function splitHand() {

    if (!playing) {
        return;
    }


    const hand =
        hands[currentHand];


    if (!hand) {
        return;
    }


    if (!canSplit(hand)) {
        return;
    }


    if (balance < hand.bet) {

        messageElement.textContent =
            "Solde insuffisant pour splitter.";

        return;

    }


    // Deuxième mise

    balance -= hand.bet;


    const firstCard =
        hand.cards[0];

    const secondCard =
        hand.cards[1];


    const hand1 = {

        cards: [firstCard],

        bet: hand.bet,

        finished: false,

        doubled: false,

        splitAces:
            firstCard.name === "A",

        surrendered: false

    };


    const hand2 = {

        cards: [secondCard],

        bet: hand.bet,

        finished: false,

        doubled: false,

        splitAces:
            secondCard.name === "A",

        surrendered: false

    };


    hands.splice(
        currentHand,
        1,
        hand1,
        hand2
    );


    messageElement.textContent =
        "Split effectué.";


    render();

    await sleep(500);


    // ==============================
    // PREMIERE MAIN
    // ==============================

    currentHand = 0;

    await dealToPlayer(0);


    // Split d'As
    if (hand1.splitAces) {

        hand1.finished = true;

    }


    // ==============================
    // DEUXIEME MAIN
    // ==============================

    currentHand = 1;

    await dealToPlayer(1);


    // Split d'As
    if (hand2.splitAces) {

        hand2.finished = true;

    }


    // ==============================
    // SPLIT D'AS
    // ==============================

    if (
        hand1.splitAces &&
        hand2.splitAces
    ) {

        messageElement.textContent =
            "Split d'As terminé.";

        render();

        await sleep(600);

        await nextHand();

        return;

    }


    // ==============================
    // PREMIERE MAIN JOUABLE
    // ==============================

    if (!hand1.splitAces) {

        currentHand = 0;

    } else {

        currentHand = 1;

    }


    messageElement.textContent =
        `Main ${currentHand + 1}. À vous de jouer.`;

    insuranceAvailable = false;

    render();

}


// ==============================
// ASSURANCE
// ==============================

function takeInsurance() {

    if (!playing) {
        return;
    }


    if (!insuranceAvailable) {
        return;
    }


    if (insuranceTaken) {
        return;
    }


    const hand =
        hands[0];


    const maxInsurance =
        hand.bet / 2;


    if (balance < maxInsurance) {

        messageElement.textContent =
            "Solde insuffisant pour l'assurance.";

        return;

    }


    insuranceBet = maxInsurance;

    balance -= insuranceBet;

    insuranceTaken = true;

    insuranceAvailable = false;


    messageElement.textContent =
        `Assurance prise : ${insuranceBet} €`;


    render();

}


// ==============================
// SURRENDER
// ==============================

async function surrender() {

    if (!playing) {
        return;
    }


    const hand =
        hands[currentHand];


    if (!hand) {
        return;
    }


    if (hand.cards.length !== 2) {
        return;
    }


    hand.surrendered = true;

    hand.finished = true;

    insuranceAvailable = false;


    messageElement.textContent =
        "Abandon.";


    render();

    await sleep(500);

    await nextHand();

}


// ==============================
// FIN DE PARTIE
// ==============================

function finishAll() {

    const dealerScore =
        getScore(dealerCards);


    for (const hand of hands) {

        const playerScore =
            getScore(hand.cards);


        // ==============================
        // SURRENDER
        // ==============================

        if (hand.surrendered) {

            const refund =
                hand.bet / 2;

            balance += refund;


            addHistory(
                `Abandon : mise ${hand.bet} € → retour ${refund} € → perte nette -${refund} €`
            );

            continue;

        }


        // ==============================
        // JOUEUR BUST
        // ==============================

        if (playerScore > 21) {

            addHistory(
                `Défaite : mise ${hand.bet} € → retour 0 € → perte nette -${hand.bet} €`
            );

            continue;

        }


        // ==============================
        // CROUPIER BUST
        // ==============================

        if (dealerScore > 21) {

            const payout =
                hand.bet * 2;

            const profit =
                hand.bet;

            balance += payout;


            addHistory(
                `Victoire : mise ${hand.bet} € → retour ${payout} € → gain net +${profit} €`
            );

            continue;

        }


        // ==============================
        // JOUEUR GAGNE
        // ==============================

        if (playerScore > dealerScore) {

            const payout =
                hand.bet * 2;

            const profit =
                hand.bet;

            balance += payout;


            addHistory(
                `Victoire : mise ${hand.bet} € → retour ${payout} € → gain net +${profit} €`
            );

        }


        // ==============================
        // CROUPIER GAGNE
        // ==============================

        else if (playerScore < dealerScore) {

            addHistory(
                `Défaite : mise ${hand.bet} € → retour 0 € → perte nette -${hand.bet} €`
            );

        }


        // ==============================
        // EGALITE
        // ==============================

        else {

            const payout =
                hand.bet;

            balance += payout;


            addHistory(
                `Égalité : mise ${hand.bet} € → retour ${payout} € → gain net 0 €`
            );

        }

    }


    finished = true;

    playing = false;


    messageElement.textContent =
        "Fin de la partie.";


    render();

}


// ==============================
// MISE +
// ==============================

plusButton.addEventListener(
    "click",
    () => {

        if (playing) {
            return;
        }


        if (bet + 10 <= balance) {

            bet += 10;

            updateBet();

        }

    }
);


// ==============================
// MISE -
// ==============================

minusButton.addEventListener(
    "click",
    () => {

        if (playing) {
            return;
        }


        if (bet > 10) {

            bet -= 10;

            updateBet();

        }

    }
);


// ==============================
// EVENEMENTS
// ==============================

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


// ==============================
// HISTORIQUE
// ==============================

function addHistory(text) {

    if (!historyElement) {
        return;
    }


    const item =
        document.createElement("div");

    item.className =
        "history-item";

    item.textContent =
        text;


    historyElement.prepend(item);

}


// ==============================
// PAUSE
// ==============================

function sleep(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );

}


// ==============================
// TOTAL DES MISES
// ==============================

function getTotalBets() {

    return hands.reduce(
        (total, hand) =>
            total + hand.bet,
        0
    );

}


// ==============================
// INITIALISATION
// ==============================

createDeck();

updateBalance();

updateBet();

render();


messageElement.textContent =
    "Placez votre mise puis lancez une partie.";
