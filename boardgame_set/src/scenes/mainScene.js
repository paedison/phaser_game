import { generateDeck } from './deck.js';
import { renderCard } from './cardRenderer.js';

class CardSprite extends Phaser.GameObjects.Image {
    constructor(scene, x, y, textureKey, frameKey, cardData) {
        super(scene, x, y, textureKey, frameKey);
        this.cardData = cardData;
        this.selected = false;
        this.getDefaultBorder();

        this.setInteractive();
        this.on('pointerdown', () => this.toggleSelect());

        scene.add.existing(this);
    }

    toggleSelect() {
        this.selected = !this.selected;
        this.updateBorder();
        this.scene.handleCardSelection(this);
    }

    getDefaultBorder() {
        this.border = this.scene.add.graphics();
        this.border.lineStyle(2, 0x555555);
        this.border.strokeRoundedRect(this.x - 70, this.y - 85, 100, 150, 10);
    }

    updateBorder() {
        if (this.border) this.border.destroy();

        if (this.selected) {
            this.border = this.scene.add.graphics();
            this.border.lineStyle(4, 0xffff00);
            this.border.strokeRoundedRect(this.x - 50, this.y - 75, 100, 150, 10);
        }
    }

    deselect() {
        this.selected = false;
        if (this.border) this.border.destroy();
    }
}

export class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.selectedCards = [];
        this.score = 0;
    }

    preload() {
        this.load.atlas('cards', 'assets/cardsheet.png', 'assets/cardsheet.json');
    }

    create() {
        const deck = generateDeck(true); // 테스트용 12장

        deck.forEach((card, index) => {
            const x = 120 + (index % 4) * 160;
            const y = 145 + Math.floor(index / 4) * 210;
            const frameKey = getCardFrame(card); // 예: 'red_diamond_2_solid'
            new CardSprite(this, x, y, 'cards', frameKey, card);
            // renderCard(this, x, y, card);
        });

        this.scoreText = this.add.text(
            1000, 20, 'Score: 0', {fontSize: '24px', fill: '000'}
        );
    }

    handleCardSelection(cardSprite) {
        if (cardSprite.selected) {
            this.selectedCards.push(cardSprite);
        } else {
            this.selectedCards = this.selectedCards.filter(c => c !== cardSprite);
        }

        if (this.selectedCards.length === 3) {
            const isSet = this.checkSet(this.selectedCards.map(c => c.cardData));
            if (isSet) {
                this.score += 1;
                console.log('✅ 세트 성공! 점수:', this.score);
                this.selectedCards.forEach(c => c.deselect());
                this.selectedCards = [];
                // TODO: 세트 카드 교체 로직
            } else {
                console.log('❌ 세트 실패');
                this.selectedCards.forEach(c => c.deselect());
                this.selectedCards = [];
            }
        }
    }

    checkSet(cards) {
        const attrs = ['color', 'shape', 'fill', 'count'];
        return attrs.every(attr => {
            const values = cards.map(c => c[attr]);
            const unique = new Set(values);
            return unique.size === 1 || unique.size === 3;
        });
    }
}

function getCardFrame(card) {
    return `${card.color}_${card.shape}_${card.count}_${card.fill}`;
}
