/* SOBA – nhạc nền giai điệu gốc (tự soạn), phát bằng Web Audio: hộp nhạc + rải hợp âm + bass nhẹ.
 * Không dùng tệp âm thanh nên không lo bản quyền và gần như không tốn dung lượng.
 * Ký hiệu giai điệu: "E5:1 G5:.5 R:1" = nốt:số phách (R = nghỉ). */
(function () {
  'use strict';
  var SONGS = {
    'nang-mai': {
      name: 'Nắng Mai', bpm: 96, beats: 4,
      chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C'],
      melody: 'E5:1 G5:1 E5:.5 D5:.5 C5:1 | D5:1 B4:1 D5:1 G5:1 | C5:1 E5:1 A5:1.5 G5:.5 | F5:1 E5:.5 D5:.5 C5:2 | E5:.5 F5:.5 G5:1 C6:1 G5:1 | B5:1 A5:.5 G5:.5 D5:2 | A5:1 G5:1 F5:1 E5:.5 D5:.5 | C5:3 R:1',
    },
    'hen-uoc': {
      name: 'Hẹn Ước', bpm: 132, beats: 3,
      chords: ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D', 'G', 'C', 'D', 'G'],
      melody: 'B4:1 D5:1 G5:1 | F#5:2 E5:1 | E5:1 G5:1 B5:1 | A5:2 G5:1 | G5:1 F#5:1 E5:1 | D5:2 A4:1 | C5:1 E5:1 A5:1 | F#5:3 | B5:1 A5:1 G5:1 | E5:2 G5:1 | F#5:1 E5:1 D5:1 | G5:3',
    },
    'buoc-chan-vui': {
      name: 'Bước Chân Vui', bpm: 112, beats: 4,
      chords: ['F', 'C', 'Dm', 'Bb', 'F', 'C', 'Bb', 'F'],
      melody: 'C5:.5 F5:.5 A5:.5 F5:.5 C6:1 A5:1 | G5:.5 E5:.5 C5:.5 E5:.5 G5:2 | F5:.5 A5:.5 D6:1 C6:.5 A5:.5 F5:1 | D5:1 F5:1 Bb5:1 A5:1 | A5:.5 G5:.5 F5:1 C5:1 F5:1 | E5:1 G5:1 C6:2 | D6:1 C6:.5 Bb5:.5 A5:1 G5:1 | F5:3 R:1',
    },
    'chieu-bien': {
      name: 'Chiều Biển', bpm: 84, beats: 4,
      chords: ['D', 'A', 'Bm', 'G', 'D', 'A', 'G', 'D'],
      melody: 'F#5:2 A5:1 F#5:1 | E5:2 C#5:1 E5:1 | D5:1 F#5:1 B5:2 | A5:1 G5:1 D5:2 | F#5:1 A5:1 D6:1.5 C#6:.5 | B5:1 A5:1 E5:2 | G5:1 F#5:1 E5:1 D5:.5 E5:.5 | D5:4',
    },
    'hoa-co': {
      name: 'Hoa Cỏ', bpm: 100, beats: 4,
      chords: ['A', 'E', 'F#m', 'D', 'A', 'E', 'D', 'A'],
      melody: 'C#5:.5 E5:.5 A5:1 B5:.5 A5:.5 E5:1 | G#5:1 B5:1 E5:2 | A5:.5 G#5:.5 F#5:1 C#5:1 F#5:1 | F#5:1 E5:1 D5:2 | E5:.5 A5:.5 C#6:1 B5:1 A5:1 | B5:1.5 G#5:.5 E5:2 | F#5:1 A5:1 E5:1 D5:1 | A4:2 C#5:1 A5:1',
    },
    'dem-sao': {
      name: 'Đêm Sao', bpm: 76, beats: 4,
      chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'C'],
      melody: 'E5:2 A5:1 C6:1 | A5:2 G5:1 F5:1 | E5:1 G5:1 C6:2 | B5:2 D5:2 | C6:1 B5:1 A5:1 E5:1 | F5:1 A5:1 C6:2 | B5:1 G5:1 D5:1 B4:1 | C5:4',
    },
    'song-hy': {
      name: 'Song Hỷ', bpm: 108, beats: 4,
      chords: ['G', 'C', 'D', 'G', 'Em', 'C', 'D', 'G'],
      melody: 'G5:.5 A5:.5 B5:1 D6:1 B5:1 | E5:1 G5:.5 A5:.5 G5:2 | A5:.5 B5:.5 A5:.5 G5:.5 E5:1 D5:1 | G5:3 R:1 | E5:.5 G5:.5 B5:1 A5:.5 G5:.5 E5:1 | G5:1 E5:.5 D5:.5 E5:2 | D5:.5 E5:.5 G5:1 A5:1 B5:1 | G5:3 R:1',
    },
  };

  var NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  function midi(n) {
    var m = /^([A-G][#b]?)(\d)$/.exec(n);
    return m ? 12 * (Number(m[2]) + 1) + NOTE[m[1]] : null;
  }
  function freq(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }
  function chordNotes(c) {
    var m = /^([A-G][#b]?)(m?)$/.exec(c);
    var root = 48 + NOTE[m[1]]; // quãng tám 3
    return [root, root + (m[2] ? 3 : 4), root + 7];
  }
  function parse(song) {
    var bars = song.melody.split('|').map(function (b) {
      return b.trim().split(/\s+/).map(function (t) {
        var p = t.split(':');
        return { m: p[0] === 'R' ? null : midi(p[0]), d: parseFloat(p[1]) };
      });
    });
    return bars;
  }

  function Player(key) {
    this.song = SONGS[key] || SONGS['nang-mai'];
    this.bars = parse(this.song);
    this.paused = true;
  }
  Player.prototype._setup = function () {
    if (this.ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    var ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.gain.value = 0.32;
    // tiếng vang nhẹ bằng delay hồi tiếp
    var delay = ctx.createDelay(1);
    delay.delayTime.value = 0.27;
    var fb = ctx.createGain();
    fb.gain.value = 0.28;
    var wet = ctx.createGain();
    wet.gain.value = 0.22;
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3200;
    this.bus = ctx.createGain();
    this.bus.connect(this.master);
    this.bus.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(wet);
    wet.connect(this.master);
    this.master.connect(lp);
    lp.connect(ctx.destination);
  };
  Player.prototype._tone = function (f, t, dur, type, vol, attack, release) {
    var ctx = this.ctx;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur + release);
    o.connect(g);
    g.connect(this.bus);
    o.start(t);
    o.stop(t + dur + release + 0.05);
  };
  Player.prototype._bar = function (i, t) {
    var s = this.song;
    var beat = 60 / s.bpm;
    var chord = chordNotes(s.chords[i % s.chords.length]);
    var barDur = beat * s.beats;
    // đệm: nền êm
    var self = this;
    chord.forEach(function (n) {
      self._tone(freq(n), t, barDur * 0.9, 'sine', 0.035, 0.25, 0.4);
    });
    // bass
    this._tone(freq(chord[0] - 12), t, beat * 1.4, 'sine', 0.11, 0.02, 0.3);
    if (s.beats === 4) this._tone(freq(chord[0] - 5), t + beat * 2, beat * 1.4, 'sine', 0.08, 0.02, 0.3);
    // rải hợp âm (móc đơn)
    var arp = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[1] + 12];
    for (var k = 0; k < s.beats * 2; k++) this._tone(freq(arp[k % 4]), t + (k * beat) / 2, beat * 0.4, 'triangle', 0.028, 0.01, 0.25);
    // giai điệu hộp nhạc
    var at = t;
    this.bars[i % this.bars.length].forEach(function (n) {
      if (n.m) {
        self._tone(freq(n.m), at, Math.min(n.d * beat, 1.2), 'triangle', 0.12, 0.008, 0.5);
        self._tone(freq(n.m + 12), at, 0.18, 'sine', 0.035, 0.005, 0.3); // ánh chuông
      }
      at += n.d * beat;
    });
    return barDur;
  };
  Player.prototype._loop = function () {
    var self = this;
    var ahead = 0.4;
    while (this.next < this.ctx.currentTime + ahead) {
      this.next += this._bar(this.i, this.next);
      this.i = (this.i + 1) % this.bars.length;
    }
    this.timer = setTimeout(function () {
      self._loop();
    }, 120);
  };
  Player.prototype.play = function () {
    try {
      this._setup();
    } catch (e) {
      return Promise.reject(e);
    }
    var self = this;
    return this.ctx.resume().then(function () {
      if (!self.paused) return;
      self.paused = false;
      self.master.gain.cancelScheduledValues(self.ctx.currentTime);
      self.master.gain.setValueAtTime(0.32, self.ctx.currentTime);
      self.i = 0;
      self.next = self.ctx.currentTime + 0.08;
      self._loop();
    });
  };
  Player.prototype.pause = function () {
    if (this.paused || !this.ctx) return;
    this.paused = true;
    clearTimeout(this.timer);
    var t = this.ctx.currentTime;
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    this.master.gain.linearRampToValueAtTime(0, t + 0.4);
    var ctx = this.ctx;
    var self = this;
    setTimeout(function () {
      if (self.paused) ctx.suspend();
    }, 500);
  };

  window.SobaMusic = {
    list: Object.keys(SONGS).map(function (k) {
      return { key: k, name: SONGS[k].name };
    }),
    create: function (key) {
      return new Player(key);
    },
    /** "builtin:nang-mai" → "nang-mai" */
    keyOf: function (url) {
      var m = /^builtin:([a-z0-9-]+)$/.exec(url || '');
      return m && SONGS[m[1]] ? m[1] : null;
    },
  };
})();
