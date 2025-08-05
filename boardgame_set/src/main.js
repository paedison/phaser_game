import {MainScene} from './scenes/mainScene.js';

const config = {
    type: Phaser.AUTO,
    title: 'Boardgame SET',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#FFF',
    pixelArt: false,
    scene: [
        MainScene,
        // Start,
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
