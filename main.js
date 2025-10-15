const W = 480, H = 720;  // Ukuran layar game (sesuai perangkat)

const FRUITS = [
  { level: 1, radius: 20, color: 0x96f97b, score: 1 },  // Buah level 1
  { level: 2, radius: 25, color: 0x6ee7ff, score: 3 },  // Buah level 2
  { level: 3, radius: 30, color: 0xfdd663, score: 6 },  // Buah level 3
  { level: 4, radius: 40, color: 0xff9aa2, score: 10 }, // Buah level 4
];

let scoreEl, nextEl;

class GameScene extends Phaser.Scene {
  constructor() {
    super('game');
  }
  
  preload() {
  // Memuat gambar buah
  this.load.image('YUAN 1', 'assets/YUAN 1.png');       // Buah level 1
  this.load.image('YUAN 2', 'assets/YUAN 2.png');       // Buah level 2
  this.load.image('YUAN 3', 'assets/YUAN 3.png');       // Buah level 3
  this.load.image('YUAN 4', 'assets/YUAN 4.png');       // Buah level 4
  }

  create() {
    scoreEl = document.getElementById('score');
    nextEl = document.getElementById('next');

    // Pengaturan fisika
    this.matter.world.setBounds(24, 24, W-48, H-48, 32, true, true, true, true);

    // Buah yang sudah dijatuhkan
    this.fruits = [];
    
    // Mendapatkan posisi sentuhan
    this.spawnerX = W / 2;
    this.input.on('pointermove', (pointer) => {
      this.spawnerX = Phaser.Math.Clamp(pointer.x, 60, W - 60);
    });

    // Untuk buah berikutnya
    this.nextIndex = 0;
    this.updateNextHud();
    this.spawnPreview();

    // Klik / Sentuh untuk menjatuhkan buah
    this.input.on('pointerdown', () => {
      this.dropFruit(this.nextIndex, this.spawnerX, 80);
      this.nextIndex = Phaser.Math.Between(0, 2);
      this.updateNextHud();
      this.spawnPreview();
    });

    this.score = 0;
    this.gameOverFlag = false;
  }
  
  // Menampilkan preview buah yang akan datang
  spawnPreview() {
    if (this.preview) this.preview.destroy();
    const spec = FRUITS[this.nextIndex];
    this.preview = this.add.circle(this.spawnerX, 80, spec.radius, spec.color, 0.35);
    this.preview.setDepth(10);
  }

  // Menjatuhkan buah di posisi x dan y tertentu
  dropFruit(index, x, y) {
    if (this.gameOverFlag) return;
    const spec = FRUITS[index];

      let fruitImage;
  if (spec.level === 1) {
    fruitImage = 'YUAN 1'; // Gambar melon untuk level 1
  } else if (spec.level === 2) {
    fruitImage = 'YUAN 2'; // Gambar watermelon untuk level 2
  } else if (spec.level === 3) {
    fruitImage = 'YUAN 3'; // Gambar apple untuk level 3
  }

    const fruit = this.add.circle(x, y, spec.radius, spec.color);
    const body = this.matter.add.circle(x, y, spec.radius, {
      restitution: 0.1, friction: 0.05, density: 0.001
    });
    fruit.setData('isFruit', true);
    fruit.setData('level', spec.level);
    fruit.setData('radius', spec.radius);
    fruit.setData('merging', false);
    fruit.setData('body', body);
    fruit.setExisting(body);
    this.fruits.push(fruit);
  }

  // Menggabungkan dua buah yang selevel
  merge(a, b) {
    a.setData('merging', true);
    b.setData('merging', true);

    const level = a.getData('level');
    const nextIdx = Math.min(level, FRUITS.length - 1); // Level tinggi akan menjadi level berikutnya
    const specNext = FRUITS[nextIdx];

    // Posisi gabungan buah
    const x = (a.x + b.x) / 2;
    const y = (a.y + b.y) / 2 - 6;

    // Hapus buah yang digabung
    this.removeFruit(a);
    this.removeFruit(b);

    // Tambah skor
    this.addScore(specNext.score);

    let mergedFruitImage;
  if (specNext.level === 1) {
    mergedFruitImage = 'YUAN 1';
  } else if (specNext.level === 2) {
    mergedFruitImage = 'YUAN 2';
  } else if (specNext.level === 3) {
    mergedFruitImage = 'YUAN 3';
  }

    // Buah baru dengan level lebih tinggi
    this.dropFruit(nextIdx, x, y);
  
    this.tweens.add({ targets: this.fruits[this.fruits.length - 1], scale: 1.12, yoyo: true, duration: 90 });

    fruit.setDisplaySize(spec.radius * 2, spec.radius * 2); // Menyesuaikan ukuran gambar

  // Menghapus buah dari dunia fisika
  removeFruit(fruit) 
    const body = fruit.getData('body');
    if (body) this.matter.world.remove(body);
    Phaser.Utils.Array.Remove(this.fruits, fruit);
    fruit.destroy();
  }

  // Menambah skor
  addScore(score) {
    this.score += score;
    scoreEl.textContent = this.score;
  }

  // Memperbarui level buah berikutnya
  updateNextHud() {
    nextEl.textContent = 'Lv' + FRUITS[this.nextIndex].level;
  }

  // Game over jika buah menyentuh sensor atas
  gameOver() {
    if (this.gameOverFlag) return;
    this.gameOverFlag = true;
    this.add.text(W / 2, H / 2, 'GAME OVER', { fontSize: '36px', color: '#fff' }).setOrigin(0.5);
    this.time.delayedCall(1200, () => location.reload());
  }
}

new Phaser.Game({
  type: Phaser.CANVAS,
  width: W,
  height: H,
  backgroundColor: '#111318',
  canvas: document.getElementById('game'),
  physics: { default: 'matter', matter: { gravity: { y: 1.1 } } },
  scene: [GameScene]
});
