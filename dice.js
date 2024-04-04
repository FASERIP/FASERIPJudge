import { randomBytes as _randomBytes } from 'crypto';

const DICE = {
    D10: 10,
    D100: 100
};

function rollDie(sides = DICE.D100) {
    const randomBytes = _randomBytes(4);
    const randomNumber = randomBytes.readUInt32BE(0);
    return (randomNumber % sides) + 1;
}

function rollD100() {
    return rollDie(DICE.D100);
}

function rollD10() {
    return rollDie(DICE.D10);
}

export {
    rollDie,
    rollD100,
    rollD10,
    DICE
};
