document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const hangman = new Hangman(canvas);
    hangman.start();
});