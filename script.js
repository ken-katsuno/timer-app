/* ------------------ */
/* 共通スタイル */
/* ------------------ */
body {
  background: #000; /* 黒背景 */
  font-family: 'Anton', sans-serif;
  color: #fff;
  margin: 0;
  padding: 0;
}

.timer-container {
  width: 95%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

/* ------------------ */
/* Pre‑start UI（番組開始前） */
/* ------------------ */
.prestart-ui {
  margin-top: 40px;
}
.program-time-input {
  margin-bottom: 20px;
  font-size: 2em;
}
.program-time-input input {
  width: 60px;
  padding: 10px;
  margin: 0 10px;
  border: 2px solid #fff;
  border-radius: 5px;
  font-size: 2em;
  background: transparent;
  color: #fff;
}
.program-time-input span {
  font-size: 2em;
  color: #fff;
}
.news-items ul {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}
.news-items li {
  margin-bottom: 20px;
}
.news-items input {
  width: 200px;
  padding: 10px;
  margin: 0 10px;
  border: 2px solid #fff;
  border-radius: 5px;
  font-size: 2em;
  background: transparent;
  color: #fff;
}
#add-item,
#start {
  background: transparent;
  color: #fff;
  border: 2px solid #fff;
  padding: 15px 30px;
  border-radius: 5px;
  font-size: 2em;
  cursor: pointer;
  transition: background 0.3s;
}
#add-item:hover,
#start:hover {
  background: #fff;
  color: #000;
}

/* Pre‑start UI：クッション時間表示 */
#pre-cushion-time {
  font-size: 2em;
  margin: 20px 0;
}
#pre-cushion-time .label {
  font-size: 0.5em;
}
#pre-cushion-time .value {
  font-size: 2.5em;
}

/* Pre‑start UI 表示 */
.pre-start .prestart-ui {
  display: block;
}
.pre-start .running-ui {
  display: none;
}

/* ------------------ */
/* Running UI（タイマー開始後） */
/* ------------------ */
/* CSS Grid レイアウトで配置 */
.running-ui {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "time-left cushion-time"
    "current-news current-news"
    "end-item reset";
  gap: 10px;
  height: 100vh;
  align-items: center;
  justify-items: center;
}

/* 左上：残り番組時間（ラベルは小さく、数字は大きく） */
#time-left {
  grid-area: time-left;
  width: 100%;
  padding-left: 20px;
  text-align: left;
}
#time-left .label {
  font-size: 0.5em;
}
#time-left .value {
  font-size: 5em;
}

/* 右上：クッション時間（ラベルは小さく、数字は大きく） */
#cushion-time {
  grid-area: cushion-time;
  width: 100%;
  padding-right: 20px;
  text-align: right;
}
#cushion-time .label {
  font-size: 0.5em;
}
#cushion-time .value {
  font-size: 5em;
}

/* 中央：ニュースのタイトル（左右にまたがる） */
#current-news {
  grid-area: current-news;
  font-size: 4em;
  text-align: center;
  width: 100%;
}

/* 左下：項目終了ボタン（そこそこ大きく） */
#end-item {
  grid-area: end-item;
  font-size: 2.5em;
  justify-self: start;
  align-self: end;
  margin-left: 20px;
  background: transparent;
  color: #fff;
  border: 2px solid #fff;
  padding: 15px 30px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}
#end-item:hover {
  background: #fff;
  color: #000;
}

/* 右下：リセットボタン（小さめ） */
#reset {
  grid-area: reset;
  font-size: 1.5em;
  justify-self: end;
  align-self: end;
  margin-right: 20px;
  background: transparent;
  color: #fff;
  border: 2px solid #fff;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}
#reset:hover {
  background: #fff;
  color: #000;
}

/* Running UI 表示 */
.running .prestart-ui {
  display: none;
}
.running .running-ui {
  display: block;
  text-align: center;
}

/* メディアクエリ例（スマホ対応） */
@media screen and (max-width: 480px) {
  .running-ui {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto auto;
    grid-template-areas:
      "time-left"
      "cushion-time"
      "current-news"
      "end-item"
      "reset";
  }
  #time-left, #cushion-time {
    padding: 0;
    text-align: center;
  }
  #time-left .value, #cushion-time .value {
    font-size: 4em;
  }
  #current-news {
    font-size: 3em;
  }
  #end-item {
    font-size: 2em;
    margin: 10px;
    justify-self: center;
  }
  #reset {
    font-size: 1.2em;
    margin: 10px;
    justify-self: center;
  }
}
