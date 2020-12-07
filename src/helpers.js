import firebase from './firebase';

export const randomNumberGenerator = () => {

    let max = 7;
    let random = Math.floor(Math.random() * max) //Finds number between 0 - max

    return random
}

export const findNextColor = (colorsPicked) => {
    for(let i = 0 ; i <= 7; i++) {
        if(colorsPicked[i] < 2 ) {
            return i;
        }
    }
}
