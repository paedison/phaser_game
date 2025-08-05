import { generateDeck } from "./deck.js";
import { constants } from "../constants.js";

class CardSprite extends Phaser.GameObjects.Image {
    constructor(scene, index, card) {
        const cardWidth = constants.CARD_WIDTH;
        const cardHeight = constants.CARD_HEIGHT;
        const cardPadding = constants.CARD_PADDING;

        const x = cardWidth + (index % 4) * (cardWidth + cardPadding);
        const y = cardHeight + Math.floor(index / 4) * (cardHeight + cardPadding);
        const frameKey = `${card.color}_${card.shape}_${card.count}_${card.fill}`

        super(scene, x, y, "cards", frameKey);

        this.x = x;
        this.y = y;
        this.cardWidth = cardWidth
        this.cardHeight = cardHeight;
        this.cardData = card;
        this.selected = false;

        this.setInteractive();
        this.setDisplaySize(this.cardWidth, this.cardHeight);
        this.getDefaultBorder();
        this.on("pointerdown", () => this.toggleSelect());

        scene.add.existing(this);
    }

    toggleSelect() {
        this.selected = !this.selected;
        this.updateBorder();
        this.scene.handleCardSelection(this);
    }

    drawCardBorder(lineWidth, color) {
        this.border = this.scene.add.graphics();
        this.border.lineStyle(lineWidth, color);
        this.border.strokeRect(
            this.x - this.cardWidth / 2 - 5,
            this.y - this.cardHeight / 2 - 5,
            this.cardWidth + 10,
            this.cardHeight + 10,
        );
    }

    getDefaultBorder() {
        this.drawCardBorder(4, 0xeeeeee);
    }

    updateBorder() {
        if (this.border) {
            this.border.destroy();
            this.getDefaultBorder();
        }

        if (this.selected) {
            this.drawCardBorder(4, 0x008800);
        }
    }

    deselect() {
        this.selected = false;
        if (this.border) this.border.destroy();
    }
}

export class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
        this.deck = generateDeck(true); // 테스트용 12장
        this.selectedCards = [];
        this.score = 0;
    }

    preload() {
        this.load.atlas("cards", "assets/cardsheet.png", "assets/cardsheet.json");
    }

    create() {
        this.createInitialSprites();
        this.createRestartButton();
        this.createHintButton();

        this.scoreText = this.add.text(
            1000, 20, "Score: 0", {fontSize: "24px", fill: "000"}
        );
    }

    createInitialSprites() {
        this.deck.forEach((card, index) => new CardSprite(this, index, card));
    }

    createRestartButton() {
        const restartButton = this.add.text(1000, 50, '🔄 다시 시작하기', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#007bff',
            padding: { x: 10, y: 5 }
        }).setInteractive();

        restartButton.on('pointerdown', () => {
            this.restartGame();
        });
    }

    restartGame() {
        // 게임 상태 초기화
        this.selectedCards = [];
        this.score = 0;
        this.deck.shuffle();
        this.renderCards(); // 카드 다시 배치
        this.message.setText('게임을 다시 시작했습니다!');
    }

    createHintButton() {
        const hintButton = this.add.text(1000, 100, '💡 힌트 보기', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#28a745',
            padding: { x: 10, y: 5 }
        }).setInteractive();

        hintButton.on('pointerdown', () => {
            this.showHint();
        });
    }

    showHint() {
        const possibleSets = this.findPossibleSets(); // 가능한 세트 찾기
        if (possibleSets.length > 0) {
            const hintSet = possibleSets[0];
            hintSet.forEach(card => {
                card.setTint(0xffff00); // 노란색으로 강조
            });
            this.message.setText('힌트를 표시했습니다!');
        } else {
            this.message.setText('힌트가 없습니다!');
        }
    }

    findPossibleSets() {
        const sets = [];
        const cards = this.visibleCards;

        for (let i = 0; i < cards.length - 2; i++) {
            for (let j = i + 1; j < cards.length - 1; j++) {
                for (let k = j + 1; k < cards.length; k++) {
                    const trio = [cards[i], cards[j], cards[k]];
                    if (this.isValidSet(trio)) {
                        sets.push(trio);
                    }
                }
            }
        }

        return sets;
    }

    handleCardSelection(cardSprite) {
        if (cardSprite.selected) {
            this.selectedCards.push(cardSprite);
        } else {
            this.selectedCards = this.selectedCards.filter(c => c !== cardSprite);
        }

        if (this.selectedCards.length === 3) {
            setTimeout(() => {
                const isSet = this.checkSet(this.selectedCards.map(c => c.cardData));
                if (isSet) {
                    this.score += 1;
                    console.log("✅ 세트 성공! 점수:", this.score);
                    this.selectedCards.forEach(c => c.deselect());
                    this.selectedCards = [];
                    // TODO: 세트 카드 교체 로직
                } else {
                    console.log("❌ 세트 실패");
                    this.selectedCards.forEach(c => c.deselect());
                    this.selectedCards = [];
                }
            }, 500);
        }
    }

    checkSet(cards) {
        return constants.CARD_ATTRS.every(attr => {
            const values = cards.map(c => c[attr]);
            const unique = new Set(values);
            return unique.size === 1 || unique.size === 3;
        });
    }
}

function getCardFrame(card) {
    return `${card.color}_${card.shape}_${card.count}_${card.fill}`;
}
