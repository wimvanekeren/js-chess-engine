// bais board: pieces, files, ranks, colours
var BRD_SQ_NUM = 120;
var PIECES = {EMPTY: 0, wP : 1, wN : 2, wB : 3, wR : 4, wQ : 5, wK : 6, 
						bP : 7, bN : 8, bB : 9, bR : 10, bQ : 11, bK : 12 };
var FILES = {FA:0, FB: 1, FC:2, FD:3, FE:4, FF:5, FG: 6, FH: 7, FNONE: 8};
var RANKS = {R1:0,R2:1,R3:2,R4:3,R5:4,R6:5,R7:6,R8:7,RNONE:8};
var COLOURS = { WHITE:0, BLACK:1, BOTH:2 };

// define different castle s
var CASTLEBIT = { WKCA : 1, WQCA : 2, BKCA : 4, BQCA : 8 };

// somehow we need some defines of square positions of first row on each side
var SQUARES = {
	A1:21,B1:22,C1:23,D1:24,E1:25,F1:26,G1:27,H1:28,
	A8:91,B8:92,C8:93,D8:94,E8:95,F8:96,G8:97,H8:98,
	NO_SQ:99, OFFBOARD:100
};

var BOOL = {FALSE:0, TRUE:1 };

var MAXGAMEMOVES = 2048;
var MAXPOSITIONMOVES = 256;
var MAXDEPTH = 64;


var FilesBrd = new Array(BRD_SQ_NUM);
var RanksBrd = new Array(BRD_SQ_NUM);

var START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

var PceChar = ".PNBRQKpnbrqk";
var SideChar = "wb-";
var RankChar = "12345678";
var FileChar = "abcdefgh";

// var FILES = new Array(BRD_SQ_NUM);

function FR2SQ(f,r) {
	return ((21 + f) + (r*10));
};


var PieceBig = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
var PieceMaj = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
var PieceMin = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
var PieceVal = [ 0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000  ];
var PieceCol = [ COLOURS.BOTH, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK ];
	
var PiecePawn = [ BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
var PieceKnight = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
var PieceKing = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE ];
var PieceRookQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];
var PieceBishopQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE ];
var PieceSlides = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];


// PieceKeys: each element defines a unique key for a particular piece being at a particular position
// So we have a key for each piece at each position, so 120 squares, 14 pieces
var PieceKeys = new Array(14 * 120);
var SideKey;
var CastleKeys = new Array(16);
// en pas key: PIECE_EMPTY*120 + sq in list of PieceKeys 

var Sq120ToSq64 = new Array(BRD_SQ_NUM);
var Sq64ToSq120 = new Array(64);


function RAND_32() {
	return (Math.floor((Math.random()*255)+1) << 23) | (Math.floor((Math.random()*255)+1) << 16)
			| (Math.floor((Math.random()*255)+1)<< 8) | Math.floor((Math.random()*255)+1);
}

function SQ64(sq120) {
	return Sq120ToSq64[sq120];
}

function SQ120(sq64) {
	return Sq64ToSq120[sq64];
}

// returns the index for pList(index) for a given piece in PIECES and the piece index number.
// piece: 		piece enum from PIECES
// piece_id: 	0-9, max of 10 pieces of each type reserved
// returns 		index of pList to give the square the piece is on
function PCEINDEX(piece, piece_id) {
	return (piece*10 + piece_id);
}

