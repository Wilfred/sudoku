var GROUPWIDTH = 3;
var GROUPHEIGHT = 3;

// board height = borad width, since a sudoku board is square
var BOARDSIZE = GROUPWIDTH * GROUPHEIGHT;

var BLANK = "";
var VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

var sudokuSolver = {
	getTable: function() {
		// start with a blank table
		var table = sudokuSolver.createBlankTable();

		// then write in the current values
		$("#sudoku tr").each(function(y, element) {
			$("td input", $(element)).each(function(x, element) {
				table[x][y] = $(element).val();
			});
		});

		return table;
	},

	createBlankTable: function() {
		// create an array of BOARDSIZE x BOARDSIZE, filled with blanks
		var columns = [];
		for (var i=0; i<BOARDSIZE; i++) {
			var column = [];
			for (var j=0; j<BOARDSIZE; j++) {
				column.push(BLANK);
			}
			columns.push(column);
		}
		return columns;
	},

	addUserValuesClass: function() {
		// add an additional class to user-provided cells, so
		// we can style them differently
		$("#sudoku td input").each(function(index, element) {
			var $input = $(element);

			console.log($input.val());

			if ($input.val() !== BLANK) {
				$input.parent().addClass("user_value");
			}
		});
	},

	removeUserValuesClass: function() {
		// undoes addUserValuesClass
		$("#sudoku td").each(function(index, element) {
			var $td = $(element);
			$td.removeClass("user_value");
		});
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
		var row = [];

		$.each(table, function(index, column) {
			row.push(column[y]);
		});

		return row;
	},

	getColumn: function(table, x) {
		// get column which is x across, where 0 is leftmost
		return table[x];
	},

	getGroup: function(table, x, y) {
		// get the group which is x groups across and y groups down
		// returning a 1-D array
		var group = [];

		var total = 0;
		for (var i=x*GROUPWIDTH; i<(x+1)*GROUPWIDTH; i++) {
			for (var j=y*GROUPHEIGHT; j<(y+1)*GROUPHEIGHT; j++) {
				group.push(table[i][j]);
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
		// deliberately iterating over x first as it often
		// produces more attractive (IMHO) results
		for (var y=0; y<BOARDSIZE; y++) {
			for (var x=0; x<BOARDSIZE; x++) {
				if (table[x][y] === BLANK) {
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
				table[x][y] = VALUES[i];

				if (sudokuSolver.isTableValid(table)) { // valid so far
					var solution = sudokuSolver.findSolution(table);
					if (solution !== false) {
						return solution;
					}
				} else {
					// reset this square for the backtracking
					// FIXME: this overwrites user-provided values
					table[x][y] = BLANK;
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
		sudokuSolver.addUserValuesClass();
		
		var currentTable = sudokuSolver.getTable();
		var solvedTable = sudokuSolver.findSolution(currentTable);
		sudokuSolver.setTable(solvedTable);
	});

	$('button#clear_table').click(function() {
		sudokuSolver.removeUserValuesClass();
		
		var blankTable = sudokuSolver.createBlankTable();
		sudokuSolver.setTable(blankTable);
	});
});