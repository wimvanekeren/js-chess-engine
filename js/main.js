$(function() {
	init();
	console.log("Main Init Called");
	ParseFen(START_FEN);
	PrintBoard();
});


function InitFilesRanksBrd() {
	var index = 0;
	var file = FILES.FA;
	var rank = RANKS.R1;
	var sq = SQUARES.A1;
	// console.log("SQUARES.A1: "+SQUARES.A1);
	// FilesBrd[0] = SQUARES.OFFBOARD
	// console.log("FilesBrd[0]: "+FILES[0]);
	
	for (index = 0; index < BRD_SQ_NUM; ++index)
	{
		FilesBrd[index] = SQUARES.OFFBOARD;
		RanksBrd[index] = SQUARES.OFFBOARD;
	}

	for (rank = RANKS.R1; rank <= RANKS.R8; ++rank) {
		for (file = FILES.FA; file <= FILES.FH; ++file) {
			sq = FR2SQ(file,rank);
			FilesBrd[sq] = file;
			RanksBrd[sq] = rank;
		}
	}
	console.log("FilesBoard[0]: " + FilesBrd[0] + " RanksBrd[0]:" + RanksBrd[0]);
	console.log("FilesBoard[A1]: " + FilesBrd[SQUARES.A1] + " RanksBrd[A1]:" + RanksBrd[SQUARES.A1]);
	console.log("FilesBoard[E8]: " + FilesBrd[SQUARES.E8] + " RanksBrd[E8]:" + RanksBrd[SQUARES.E8]);
}

function InitHashKeys() {
	var index = 0;

	// PieceKeys
	for(index = 0; index < 14 * 120; ++index) {
		PieceKeys[index] = RAND_32();
	}

	// SideKeys
	SideKey = RAND_32();

	// CastleKeys 
	for(index = 0; index < 16; ++index) {
		CastleKeys[index] = RAND_32();
	}
}

function InitSq120To64() {
	var index = 0;
	var file = FILES.FILE_A;
	var rank = RANKS.RANK_1;
	var sq = SQUARES.A1;
	var sq64 = 0;

	// reset arrays first
	for (index = 0; index < BRD_SQ_NUM; ++index) {
		Sq120ToSq64[index] = 65;
	}
	for (index = 0; index < 64; ++index) {
		Sq64ToSq120[index] = 120;
	}

	for (rank = RANKS.RANK_1; rank < RANKS.RANK_8; ++rank) {
		for (file = FILES.FILES_A; file < FILES.FILE_H; ++file) {
			// get sq120 index at current file,rank:
			sq = FR2SQ(file,rank);

			// store array
			Sq64ToSq120[sq64] = sq;
			Sq120ToSq64[sq] = sq64;

			// new sq64 index at next file,rank:
			sq64++;
		}
	}
}

function init() {
	
	console.log("init called.");
	InitFilesRanksBrd();
	InitHashKeys();


}
