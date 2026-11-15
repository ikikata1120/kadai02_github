
    // オセロ盤の状態を記憶する
    // 0：石なし、1：白、2：黒
    let board = [
        [0,0,0,0],
        [0,1,2,0],
        [0,2,1,0],
        [0,0,0,0]
    ];

    // オセロ盤を表示
    const boardElement = document.getElementById("board");

    // ⭐⭐プレイの順番を決める⭐⭐
    // 1：白（プレイヤー）、2：黒（PC）
    let turn = 1;

    // ゲームが終了したか記録する
    let gameOver = false;

    // 勝敗の記録
    let whiteWins = 0;
    let blackWins = 0;

    // PCの動作予約を記録する
    let pcTimer;

    // メッセージの行事時間を管理
    let messageTimer;

    // スキップ状態かどうかを管理
    let isPassing = false;

    // 順番を表示する場所   
    const statusElement = document.getElementById("status");


    // 4×4のオセロ盤を表示
    function drawBoard(){

        // いま表示されている盤面をクリア
        boardElement.innerHTML = "";

        let whiteCount = 0;
        let blackCount = 0;
        
    for (let row = 0; row < 4; row++){
        for(let col = 0; col < 4; col++){

            // マスの表示
            const cell = document.createElement("div");
            cell.className = "cell";

            // 白い石の配置
            if(board[row][col] === 1){
                const stone = document.createElement("div");
                stone.className = "stone white";
                cell.appendChild(stone);
                whiteCount++;
            }
            
            // 黒い石の配置
            if(board[row][col] === 2){
                const stone = document.createElement("div");
                stone.className = "stone black";
                cell.appendChild(stone);
                blackCount++;
            }

            // マスをクリックしたときに石を置く
            cell.addEventListener("click",function(){

                // ゲーム終了時やPCの番は操作できないようにする
                if(gameOver || turn !== 1 || isPassing){
                    return;
                }

                // 石を置ける場合
                if (canPlace(row,col,1)){

                    // メッセージのタイマーを取り消す
                    clearTimeout(messageTimer);
                    
                    // 白い石を置いて裏返す
                    placeStone(row, col, 1);

                    // 順番をPCに交代
                    turn = 2;

                    // 盤面を更新する
                    drawBoard();

                    // 次の番に交代
                    nextTurn();

                } else {
                    // 石を置けない場合のメッセージ
                    statusElement.textContent = "ここには置けません。";

                    // 前のメッセージタイマーを取り消す
                    clearTimeout(messageTimer);

                    // 1秒後に元の表示へ戻す
                    messageTimer = setTimeout(function(){
                        if (!gameOver && turn === 1 && !isPassing){
                            statusElement.textContent = "あなたの番です。";
                        }
                    },1000);

                }
            });

            // オセロ盤にマスを追加
            boardElement.appendChild(cell);
        }
    }
    // 石の数を更新
    document.getElementById("white-count").textContent = whiteCount;
    document.getElementById("black-count").textContent = blackCount;    
}

    // 石を置けるかのチェック
    function canPlace(row,col,color){

        // すでに石がある場合は置けない
        if (board[row][col] !==0){
            return false;
        }
    
        // 相手の石の色を決める
        let opponent = color === 1 ? 2 : 1;
    
    // 縦・横・斜めで挟めるかどうかを確認
    for (let dr = -1; dr <= 1; dr++){
        for(let dc = -1; dc <= 1; dc++){

        // 挟める石がない場合は計算できない
        if(dr === 0 && dc === 0){
            continue;
            }

        let r = row + dr;
        let c = col + dc;
        let count = 0;

        // 相手の石が連続していればOK
        while (
            r >= 0 && r < 4 &&
            c >= 0 && c < 4 &&
            board[r][c] === opponent
            ){
            count++;
            r += dr;
            c += dc;  
            }
        // 相手の石の先に自分の石があればOK
        if (
            count > 0 &&
            r >= 0 && r < 4 &&
            c >= 0 && c < 4 &&
            board[r][c] === color
        ){return true;}
        }
    }
    // どこも挟めなかった
    return false;
    }
    
    // 石を置いて裏返す関数
    function placeStone(row, col, color){
        // 石を置けない場合は終了
        if(!canPlace(row, col, color)){
            return;
        }
    
        // 相手の石の色を決める
        let opponent = color === 1 ? 2 : 1;

        // 8方向の石の配置状況を確認する
        for (let dr = -1; dr <=1; dr++){
            for(let dc = -1; dc <= 1; dc++){
                if(dr === 0 && dc === 0){
                    continue;
                }
        
            let r = row + dr;
            let c = col + dc;
        
        // 裏返す石の座標を記録する
        let flips = [];

        while(
            r >= 0 && r < 4 &&
            c >= 0 && c < 4 &&
            board[r][c] === opponent
        ){
            flips.push([r,c]);
            r += dr;
            c += dc;
        }
        // 相手の石の先に自分の石がある場合
        if (
            flips.length > 0 &&
            r >= 0 && r < 4 &&
            c >= 0 && c < 4 &&
            board[r][c] === color
        ){
        
        // 挟んだ石を自分の色に変える
        for(let[flipRow,flipCol] of flips){
            board[flipRow][flipCol] = color;

        }
        }

        }
    }
    // クリックした場所に石を置く
    board[row][col] = color;
    }

    // 石を置ける場所を探す
    function getValidMoves(color){
        let moves = [];

        for (let row = 0; row < 4; row++){
            for (let col =0; col < 4; col++){
                if(canPlace(row, col, color)){
                    moves.push([row, col]);
            }
        }
    }
    return moves;
}

    // PCがランダムに石を置く
    function pcMove(){
        // 黒が置ける場所をチェック
        let moves = getValidMoves(2);

        // ランダムに1か所を選ぶ
        let random = Math.floor(Math.random() * moves.length);

        let row = moves[random][0];
        let col = moves[random][1];

        // 黒い石を置いて裏返す
        placeStone(row, col ,2);

        // 白の番に交代
        turn = 1;

        // 盤面を更新
        drawBoard();

        // 次の順番を確認
        nextTurn();
    }

    // 順番・パス・終了の判定
    function nextTurn(){

        // ゲーム終了後は何もしない
        if (gameOver){
            return;
        }

        // 現在の順番が置ける場所チェック
        let moves = getValidMoves(turn);

        // 相手の色を取得
        let opponent = turn === 1 ? 2 : 1;

        // 置ける場所がない場合
        if (moves.length === 0){
            
            // 誰も置けないなら終了
            if (getValidMoves(opponent).length === 0){
                endGame();
                return;
            }

            // スキップのメッセージを表示
            isPassing = true;

            if (turn === 1){
                statusElement.textContent = "あなたはスキップ！";
            } else {
                statusElement.textContent = "PCはスキップ！";
            }

            // 1.5秒後に相手の番に変更
            pcTimer = setTimeout(function(){
                isPassing = false;
                turn = opponent;
                nextTurn();
            }, 1500);

            return;
            
        }

        // 順番の表示と実行
        if (turn === 1){
            statusElement.textContent = "あなたの番です。";
        } else {
            statusElement.textContent = "PCが考えています。";

            // 1秒後にPCが石を置く
            pcTimer = setTimeout(pcMove, 1000);
        }
    }

    // ゲーム終了の判定
    function endGame(){

        // 終了済みなら重複して記録しない
        if (gameOver){
            return;
        }

        gameOver = true;

        // 勝負後の石の数を確認する
        let whiteCount = Number(
            document.getElementById("white-count").textContent
        );

        let blackCount = Number(
            document.getElementById("black-count").textContent
        );

        // 勝敗を判定して記録する
        if (whiteCount > blackCount){
            
            whiteWins++;
            statusElement.textContent = "あなたの勝ち！";
        
        } else if (blackCount > whiteCount){
            blackWins++;
            statusElement.textContent = "PCの勝ち！";
        
        } else {
            statusElement.textContent = "引き分け！";
        }

        // 総合成績を画面に表示する
        document.getElementById("white-win").textContent = whiteWins;
        document.getElementById("white-lose").textContent = blackWins;

        document.getElementById("black-win").textContent = blackWins;
        document.getElementById("black-lose").textContent = whiteWins;
    }

// 「最初から」ボタンの挙動
document.getElementById("reset").addEventListener("click",function(){
    
    // 予約中の処理を取り消す
    clearTimeout(pcTimer);
    clearTimeout(messageTimer);

    // スキップ状態の解除
    isPassing = false;

    // 盤面を初期状態に戻す
    board = [
        [0,0,0,0],
        [0,1,2,0],
        [0,2,1,0],
        [0,0,0,0]
    ];

    // ⭐⭐プレイの順番を決める⭐⭐
    // 1：白（プレイヤー）、2：黒（PC）   // 
    turn = 1;

    // ゲーム終了の状態を解除
    gameOver = false;

    // 盤面を再表示する
    drawBoard();

    // 再度対戦を開始する
    nextTurn();

})


// 累計成績をリセットする
document.getElementById("reset-score").addEventListener("click", function(){

    // リセットしてよいか確認
    if (!confirm("累計成績をリセットしますか？")) {
        return;
    }

    // 勝敗の記録を0に戻す
    whiteWins = 0;
    blackWins = 0;

    // 画面の勝敗表示も0に戻す
    document.getElementById("white-win").textContent = 0;
    document.getElementById("white-lose").textContent = 0;

    document.getElementById("black-win").textContent = 0;
    document.getElementById("black-lose").textContent = 0;

});


console.log("ここまで処理できています");

// 最初の盤面を表示
drawBoard();

// ゲーム開始
nextTurn();