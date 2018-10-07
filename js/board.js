
var GameBoard = {};

GameBoard.pieces = new Array(BRD_SQ_NUM); // represents our current board with piece type on each square
GameBoard.side = COLOURS.WHITE;
GameBoard.fiftyMove = 0;
GameBoard.hisPly = 0;
GameBoard.ply = 0
GameBoard.enPas = 0; // en passant rule
GameBoard.castlePerm = 0;
GameBoard.material  = new Array(2); // material value of each colour
GameBoard.pceNum = new Array(13); // number of pieces of each type, indexed by Pce
GameBoard.pList = new Array(14 * 10); // square120 each piece is on
GameBoard.posKey = 0; // represents position on the board
GameBoard.moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveListStart = new Array(MAXDEPTH);

function PrintBoard() {
	var sq, file, rank, piece;

	console.log("Print Board.");

	console.log('\nGame Board:\n');

	for (rank = RANKS.R8; rank >= RANKS.R1; rank--) {
		line = RankChar[rank] + "    ";
		for (file  = FILES.FA; file <= FILES.FH; file++) {
			sq = FR2SQ(file,rank);
			piece = GameBoard.pieces[sq];
			line += (" " + PceChar[piece] + " ");
		}
		console.log(line);
	}

	console.log("");
	var line = "     ";
	for (file  = FILES.FA; file <= FILES.FH; file++) {
		line += (" " + FileChar[file] + " ");
	}

	console.log(line);
	console.log("side: " + SideChar[GameBoard.side]);
	console.log("enPas: " + GameBoard.enPas);
	line = "";

	if(GameBoard.castlePerm & CASTLEBIT.WKCA) line += 'K';
	if(GameBoard.castlePerm & CASTLEBIT.WQCA) line += 'Q';
	if(GameBoard.castlePerm & CASTLEBIT.BKCA) line += 'k';
	if(GameBoard.castlePerm & CASTLEBIT.BQCA) line += 'q';
	console.log("castle: " + line);
	console.log("key: " + GameBoard.posKey.toString(16));

}


function GeneratePosKey(pieceKey,sideKey,castleKey,enPasKey) {

	var sq = 0;
	var finalKey = 0;
	var piece = PIECES.EMPTY;

	for (sq = 0; sq < BRD_SQ_NUM; ++sq) {
		piece = GameBoard.pieces[sq];
		if(piece != PIECES.EMPTY && piece != SQUARES.OFFBOARD) {
			finalKey ^= PieceKeys[(piece * 120) + sq]
		}
	}

	if(GameBoard.side == COLOURS.WHITE) {
		finalKey ^= SideKey;
	}

	if(GameBoard.enPas != SQUARES.NO_SQ) {
		// enPas is indexed at the first 120 elements of PieceKeys
		finalKey ^= PieceKeys[GameBoard.enPas]
	}

	GameBoard.side = COLOURS.BOTH;
	GameBoard.enPas = SQUARES.NO_SQ;
	GameBoard.fiftyMove = 0;
	GameBoard.ply = 0;
	GameBoard.hisPly = 0;
	GameBoard.castlePerm = 0;
	GameBoard.posKey = 0;
	GameBoard.moveListStart[GameBoard.ply] = 0;

	return finalKey;
}

function ResetBoard() {
	console.log("Reset board.");
	var index = 0;
	for(index = 0; index < BRD_SQ_NUM; ++index) {
		GameBoard.pieces[index] = SQUARES.OFFBOARD;
	}

	for(index = 0; index < 14*120; ++index) {
		GameBoard.pList[index] = PIECES.EMPTY;
	}

	for (index = 0; index < 2; ++index) {
		GameBoard.material[index] = 0;
	}
	for (index = 0; index < 13; ++index) {
		GameBoard.pceNum[index] = 0;
	}

	for (index = 0; index < 64; ++index) {
		GameBoard.pieces[SQ120(index)] = PIECES.EMPTY;
	}
}

// rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
function ParseFen(fen) {

	console.log("Parse Fen.");
	ResetBoard();

	var rank = RANKS.R8;
	var file = FILES.FA;
	var piece= 0;
	var count= 0;
	var i = 0;
	var sq120 = 0;
	var fenCnt = 0; 

	while ((rank >= RANKS.R1) && fenCnt < fen.length) {
		count = 1;
		
		switch (fen[fenCnt]) {
			case 'p': piece = PIECES.bP; break;
			case 'r': piece = PIECES.bR; break;
			case 'n': piece = PIECES.bN; break;
			case 'b': piece = PIECES.bB; break;
			case 'k': piece = PIECES.bK; break;
			case 'q': piece = PIECES.bQ; break;
			case 'P': piece = PIECES.wP; break;
			case 'R': piece = PIECES.wR; break;
			case 'N': piece = PIECES.wN; break;
			case 'B': piece = PIECES.wB; break;
			case 'K': piece = PIECES.wK; break;
			case 'Q': piece = PIECES.wQ; break;
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
				piece = PIECES.EMPTY;
				count = fen[fenCnt].charCodeAt() - '0'.charCodeAt();
				break;
			case '/':
			case ' ':
				rank--
				file = FILES.FA;
				fenCnt++;
				continue;
			default:
				console.log("FEN error");
				return;
		}
		for (i=0; i < count; i++) {
			sq120 = FR2SQ(file,rank);
			GameBoard.pieces[sq120] = piece;
			file++
		}
		fenCnt++;
	} // while end
	GameBoard.side = (fen[fenCnt]=='w') ? COLOURS.WHITE : COLOURS.BLACK;

	fenCnt += 2; 

    GameBoard.side = (fen[fenCnt] === 'w') ? COLOURS.WHITE : COLOURS.BLACK;
    fenCnt += 2;
    for (i = 0; i < 4; i++) {
        if (fen[fenCnt] === ' ') {
            break;
        }
        
        switch (fen[fenCnt]) {
        case 'K':
            GameBoard.castlePerm |= CASTLEBIT.WKCA; break;
        case 'Q':
            GameBoard.castlePerm |= CASTLEBIT.WQCA; break;
        case 'k':
            GameBoard.castlePerm |= CASTLEBIT.BKCA; break;
        case 'q':
            GameBoard.castlePerm |= CASTLEBIT.BQCA; break;
        default:
            break;
        }
        fenCnt++;
    }
    fenCnt++;
    if (fen[fenCnt] === '-') {
    } else {
        file = fen[fenCnt].charCodeAt(0) - 'a'.charCodeAt(0);
        rank = fen[fenCnt + 1].charCodeAt(0) - '1'.charCodeAt(0);
        console.log("fen[fenCnt]:" + fen[fenCnt] + " File:" + file + " Rank:" + rank);
        GameBoard.enPas = FR2SQ(file, rank);
    }
    GameBoard.posKey = GeneratePosKey();

    UpdateListsMaterial();
    PrintPieceLists();

    // GameBoard.sqAttacked(21, 0); 
}

function PrintPieceLists() {
	var piece, piece_id;

	for (piece = PIECES.EMPTY; piece <= PIECES.bK; ++piece)
	{
		for (piece_id = 0; piece_id < GameBoard.pceNum[piece]; ++piece_id) {
			console.log('Piece ' + PceChar[piece] + ' on ' + PrSq(GameBoard.pList[PCEINDEX(piece,piece_id)]));
		}
	}
}


// updates GameBoard.pList using game board in GameBoard.pieces
function UpdateListsMaterial() {

	var piece, piece_id, sq120, index, colour;

	// reset lists
	for(index = 0; index < 14*120; ++index) {
		GameBoard.pList[index] = PIECES.EMPTY;
	}

	for (index = 0; index < 2; ++index) {
		GameBoard.material[index] = 0;
	}
	for (index = 0; index < 13; ++index) {
		GameBoard.pceNum[index] = 0;
	}

	for(index = 0; index < 64; ++index) {

		sq120 = SQ120(index);
		piece = GameBoard.pieces[sq120];
		// add the piece to our list
		if(piece != PIECES.EMPTY) {

			
    		// add the value to the material value of this colour
			colour = PieceCol[piece];
			GameBoard.material[colour] += PieceVal[piece];

			// add the piece to pList by piece and piece_id
			// new piece_id is the old number of pieces of this type
			piece_id = GameBoard.pceNum[piece]; 


			GameBoard.pList[PCEINDEX(piece,piece_id)] = sq120;
			GameBoard.pceNum[piece]++;
		}
	}	
}


/* 
	unique?
	Piece on Sq
	Side
	Castle
	EnPas

	pos ^= RandNum for all pces on sq
	pos ^= RandNum for all side
			..

	var piece1 = RAND_32()
	var piece2 = RAND_32()
	var piece3 = RAND_32()
	var piece4 = RAND_32()
	
	var key = 0;
	key ^= piece1;
	key ^= piece2;
	key ^= piece3;
	key ^= piece4;

	console.log("key: " + key.toString(15));
	key ^= piece1;
	console.log("piece1 out key: " + key.toString(16)); 
*/
/* 

CASTLE:

0001 WKCA 
0010 WQCA
0100 BKCA
1000 BQCA

1101 = 13, use BinaryAND to find out castle perm in 1 integer

if(1101 & WKCA) e.g.

*/


/* 
GENERATING MOVES:

loop (sq)
if piece on sq =  side to move
then genmoves() for piece on sq

^^ but that is slow...

PlistArray[index] gives sq
sqOfpiece = PlistArray[index];


index=wP * 10 + wPNum -> 0 based index of num of pieces
wN * 10 + wNNum


so, 
functin getSquareOfPiece(piece,piece_id) {
	return PlistArray[piece*10 + piece_id];
}

so, each of the whitepown squares:



say we have 4 white pawns -> GameBoard.pceNum[wP] = 4
*/