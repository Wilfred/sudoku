var GROUPWIDTH = 3;
var GROUPHEIGHT = 3;

// board height = borad width, since a sudoku board is square
var BOARDSIZE = GROUPWIDTH * GROUPHEIGHT;

var BLANK = "";
var VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function SudokuGrid() {
	// create empty grid
	this.grid = [];
	for (var i=0; i<BOARDSIZE; i++) {
		this.grid.push([]);
	}
	
}

SudokuGrid.prototype.setFromSelector = function(selector) {
	// set this table based on the text inputs provided by a selector
	var x, y;
	var self = this
	selector.each(function(index, element) {
		x = index % BOARDSIZE;
		y = Math.floor(index / BOARDSIZE);
		self.grid[x][y] = $(element).val();
	});
};

SudokuGrid.prototype.setFromString = function(string) {
	// this table based on a string of characters specifying the table
	// example string: ".......12........3..23..4....18....5.6..7.8.......9.....85.....9...4.5..47...6..."

	var x, y, value;

	for (var i=0; i<string.length; i++) {
		value = string.charAt(i);
		
		if (value in VALUES) {
			x = i % BOARDSIZE;
			y = Math.floor(i / BOARDSIZE);
			this.grid[x][y] = value;
		}
	}
};

SudokuGrid.prototype.clear = function() {
	for (var i=0; i<BOARDSIZE; i++) {
		for (var j=0; j<BOARDSIZE; j++) {
			this.grid[i][j] = BLANK;
		}
	}
};

SudokuGrid.prototype.getRow = function(y) {
	// get row at height y, where 0 is the top
	var row = [];

	$.each(this.grid, function(index, column) {
		row.push(column[y]);
	});

	return row;
	
};

SudokuGrid.prototype.getColumn = function(x) {
	// get column which is x across, where 0 is leftmost
	return this.grid[x]
};

SudokuGrid.prototype.getGroup = function(x, y) {
	// get the group which is x groups across and y groups down
	// returning a 1-D array
	var group = [];

	var total = 0;
	for (var i=x*GROUPWIDTH; i<(x+1)*GROUPWIDTH; i++) {
		for (var j=y*GROUPHEIGHT; j<(y+1)*GROUPHEIGHT; j++) {
			group.push(this.grid[i][j]);
		}
	}

	return group;
};

// todo: use underscore.js grooviness to make this cleaner:
SudokuGrid.prototype.isRegionValid = function(region) {
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
};

SudokuGrid.prototype.isValid = function(table) {
	// could this table be a valid solution, or part of
	// one? We tolerate blanks
		
	// check rows
	var row;
	for (var i=0; i<BOARDSIZE; i++) {
		row = this.getRow(i);
		if (!this.isRegionValid(row)) {
			return false;
		}
	}

	// check columns
	var column;
	for (var j=0; j<BOARDSIZE; j++) {
		column = this.getColumn(j);
		if (!this.isRegionValid(column)) {
			return false;
		}
	}

	// check groups
	var group;
	for (var i=0; i<BOARDSIZE/GROUPWIDTH; i++) {
		for (var j=0; j<BOARDSIZE/GROUPHEIGHT; j++) {
			group = this.getGroup(i, j)
			if (!this.isRegionValid(group)) {
				return false;
			}
		}
	}

	return true;
};


var sudokuSolver = {
	clearTable: function() {
		// set the table in the DOM to be blank
		sudokuSolver.removeUserValuesClass();
		
		var blankTable = new SudokuGrid();
		sudokuSolver.setTable(blankTable);
	},
	
	addUserValuesClass: function() {
		// add an additional class to user-provided cells, so
		// we can style them differently
		$("#sudoku td input").each(function(index, element) {
			var $input = $(element);

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
				$(element).val(table.grid[x][y]);
			});
		});
		
	},


	findNextEmptySquare: function(table) {
		// return the (x,y) of the next point which is blank
		// deliberately iterating over x first as it often
		// produces more attractive (IMHO) results
		for (var y=0; y<BOARDSIZE; y++) {
			for (var x=0; x<BOARDSIZE; x++) {
				if (table.grid[x][y] === BLANK) {
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
				table.grid[x][y] = VALUES[i];

				if (table.isValid()) { // valid so far
					var solution = sudokuSolver.findSolution(table);
					if (solution !== false) {
						return solution;
					}
				} else {
					// reset this square for the backtracking
					// FIXME: this overwrites user-provided values
					table.grid[x][y] = BLANK;
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

		var currentTable = new SudokuGrid();
		currentTable.setFromSelector($("#sudoku input"));
		
		var solvedTable = sudokuSolver.findSolution(currentTable);
		sudokuSolver.setTable(solvedTable);
	});

	$('button#clear_table').click(function() {
		sudokuSolver.clearTable();
	});

	$('button#import_puzzle').click(function() {
		sudokuSolver.clearTable();

		var puzzleString = prompt("Enter a puzzle string:");

		var table = new SudokuGrid();
		table.setFromString(puzzleString);
		sudokuSolver.setTable(table);
	});

});