var GROUPWIDTH = 3;
var GROUPHEIGHT = 3;

// board height = borad width, since a sudoku board is square
var BOARDSIZE = GROUPWIDTH * GROUPHEIGHT;

var BLANK = "";
var VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

var sudokuSolver = {
	getTable: function() {
		var rows = [];
		$("#sudoku tr").each(function(index, element) {
			var row = [];
			$("td input", $(element)).each(function(index, element) {
				row.push($(element).val());
			});
				
			rows.push(row);
		});

		return rows;
	},

	setTable: function(table) {
		$("#sudoku tr").each(function(y, element) {
			$("td input", $(element)).each(function(x, element) {
				$(element).val(table[x][y]);
			});
		});
		
	},

	getRow: function(table, y) {
		// get row at height y, where 0 is the top
		return table[y];
	},

	getColumn: function(table, x) {
		// get column which is x across, where 0 is leftmost
		var column = [];

		$.each(table, function(index, row) {
			column.push(row[x]);
		});

		return column;
	},

	getGroup: function(table, x, y) {
		// get the group which is x groups across and y groups down
		// returning a 1-D array
		var group = [];

		var total = 0;
		for (var i=x*GROUPWIDTH; i<(x+1)*GROUPWIDTH; i++) {
			for (var j=y*GROUPHEIGHT; j<(y+1)*GROUPHEIGHT; j++) {
				group.push(table[j][i]);
			}
		}

		return group;
	},

	// todo: use underscore.js grooviness to make this cleaner:
	isRegionValid: function(region) {
		// check that a given array contains no duplicates
		// TODO: also check that all values are legal
		var seenSoFar = {};

		for (var i=0; i<region.length; i++) {
			if (region[i] !== BLANK && region[i] in seenSoFar) {
				return false;
			} else {
				seenSoFar[region[i]] = true;
			}
		}

		return true;
	},

	isTableValid: function(table) {
		// could this table be a valid solution, or part of
		// one? We tolerate blanks
		
		// check rows
		var row;
		for (var i=0; i<BOARDSIZE; i++) {
			row = sudokuSolver.getRow(table, i);
			if (!sudokuSolver.isRegionValid(row)) {
				return false;
			}
		}

		// check columns
		var column;
		for (var j=0; j<BOARDSIZE; j++) {
			column = sudokuSolver.getColumn(table, j);
			if (!sudokuSolver.isRegionValid(column)) {
				return false;
			}
		}

		// check groups
		var group;
		for (var i=0; i<BOARDSIZE/GROUPWIDTH; i++) {
			for (var j=0; j<BOARDSIZE/GROUPHEIGHT; j++) {
				group = sudokuSolver.getGroup(table, i, j)
				if (!sudokuSolver.isRegionValid(group)) {
					return false;
				}
			}
		}

		return true;
	},

	findNextEmptySquare: function(table) {
		// return the (x,y) of the next point which is blank
		for (var y=0; y<BOARDSIZE; y++) {
			for (var x=0; x<BOARDSIZE; x++) {
				if (table[y][x] === BLANK) {
					return [x, y];
				}
			}
		}
	},

	findSolution: function(table) {
		// todo: treat tables as immutable data
		var nextEmptySquare = sudokuSolver.findNextEmptySquare(table);

		if (nextEmptySquare) {
			// try each of the possible values in the next empty square
			var x = nextEmptySquare[0];
			var y = nextEmptySquare[1];

			for (var i=0; i<VALUES.length; i++) {
				table[y][x] = VALUES[i];
				// console.log("trying " + VALUES[i] + " in position " + [x, y]);

				if (sudokuSolver.isTableValid(table)) { // valid so far
					console.log(table[2]);
					var solution = sudokuSolver.findSolution(table);
					if (solution !== false) {
						return solution;
					}
				} else {
					// reset this square for the backtracking
					table[y][x] = BLANK;
				}
			}

			// no empty square, but no solution
			return false
		} else {
			// table is full, we have a solutoin
			return table;
		}
	}
}

$(document).ready(function() {
	$('button#fill_table').click(function() {
		var blankTable = sudokuSolver.getTable();
		var solvedTable = sudokuSolver.findSolution(blankTable);
		sudokuSolver.setTable(solvedTable);
	});
});