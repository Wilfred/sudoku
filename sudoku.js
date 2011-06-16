var GROUPWIDTH = 3;
var GROUPHEIGHT = 3;

// board height = board width, since a sudoku board is square
var BOARDSIZE = GROUPWIDTH * GROUPHEIGHT;

var BLANK = "";

// utilties:
function arrayContains(value, array) {
	for (var i=0; i<array.length; i++) {
		if (array[i] === value) {
			return true;
		}
	}
	return false;
}

function SudokuGrid() {
	// create empty grid
	this.grid = [];
	for (var i=0; i<BOARDSIZE; i++) {
		this.grid.push([]);
	}
	
}

SudokuGrid.prototype.getPossibleValues = function() {
	// get all the possible values that a square can contain
	var values = [];

	for (var i=1; i <= BOARDSIZE; i++) {
		values.push(i);
	}

	return values;
}

SudokuGrid.prototype.setFromSelector = function(selector) {
	// set this table based on the text inputs provided by a selector
	var x, y;
	var self = this
	selector.each(function(index, element) {
		x = index % BOARDSIZE;
		y = Math.floor(index / BOARDSIZE);

		value = $(element).val()
		if (value != BLANK) {
			self.grid[x][y] = parseInt(value, 10);
		}
	});
};

SudokuGrid.prototype.setFromString = function(string) {
	// this table based on a string of characters specifying the table
	// example string: ".......12........3..23..4....18....5.6..7.8.......9.....85.....9...4.5..47...6..."
	var x, y, value;

	for (var i=0; i<string.length; i++) {
		value = parseInt(string.charAt(i), 10);
		
		if ($.inArray(value, this.getPossibleValues()) != -1) {
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

SudokuGrid.prototype.getEmptyPositions = function() {
	// get an array of co-ordinates of all the blank squares
	// deliberately iterating over x first as it often
	// produces more attractive (IMHO) results
	var emptyPositions = [];
	
	for (var y=0; y<BOARDSIZE; y++) {
		for (var x=0; x<BOARDSIZE; x++) {
			if (this.grid[x][y] === undefined) {
				emptyPositions.push({x: x, y: y});
			}
		}
	}

	return emptyPositions;
};

SudokuGrid.prototype.getPossibilities = function(x, y) {
	// get all the possible values that can go in this position, based on neighbours
	var possibilities = [];
	var possibleValues = this.getPossibleValues();

	for (var i=0; i<possibleValues.length; i++) {
		var value = possibleValues[i];

		var groupX = Math.floor(x / GROUPWIDTH);
		var groupY = Math.floor(y / GROUPHEIGHT);

		if (!arrayContains(value, this.getRow(y)) &&
		    !arrayContains(value, this.getColumn(x)) &&
		    !arrayContains(value, this.getGroup(groupX, groupY))) {
				possibilities.push(value);
		}
	}

	return possibilities;
}

// todo: use underscore.js grooviness to make this cleaner:
SudokuGrid.prototype.isRegionValid = function(region) {
	// check that a given array contains no duplicates
	// TODO: also check that all values are legal
	var seenSoFar = {};

	for (var i=0; i<region.length; i++) {
		if (region[i] !== undefined && region[i] in seenSoFar) {
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

var ui = {
	clearTable: function() {
		// set the table in the DOM to be blank
		ui.removeUserValuesClass();
		$("#invalid_table").hide();
		
		var blankTable = new SudokuGrid();
		ui.setTable(blankTable);
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

	checkTableIsValid: function() {
		var currentTable = new SudokuGrid();
		currentTable.setFromSelector($("#sudoku input"));

		if (!currentTable.isValid()) {
			$("#invalid_table").show();
		} else {
			$("#invalid_table").hide();
		}
		
	},

	setTable: function(table) {
		$("#sudoku tr").each(function(y, element) {
			$("td input", $(element)).each(function(x, element) {
				$(element).val(table.grid[x][y]);
			});
		});
		
	}
}


var backtrackingCrossOffSolver = {
	getMostContstrainedPositions: function(grid) {
		// given a sudoku grid, return an array of objects:
		// [{x: 1, y:0, possibilities: [2,3,6]} ..]
		// sorted so the least possibilites are first in the array
		var emptyPositions = grid.getEmptyPositions();
		var possibilitiesInGrid = [];

		for (var i=0; i<emptyPositions.length; i++) {
			var x = emptyPositions[i].x;
			var y = emptyPositions[i].y;

			var possibiltiesHere = grid.getPossibilities(x, y);

			possibilitiesInGrid.push({
				x: x, y: y, possibilities: possibiltiesHere
			});
		}

		possibilitiesInGrid.sort(backtrackingCrossOffSolver.comparePossibilites);

		return possibilitiesInGrid;

	},

	comparePossibilites: function(a, b) {
		// a comparison function that compares the length of the possibilies array
		if (a.possibilities.length < b.possibilities.length) {
			return -1;
		} else if (a.possibilities.length === b.possibilities.length) {
			return 0;
		}
		return 1;
	},
	
	findSolution: function(grid) {
		// given a sudoku grid, use a backtracking brute-force
		// algorithm, starting with the most constrained
		// positions

		var possibilitiesInGrid = backtrackingCrossOffSolver.getMostContstrainedPositions(grid);

		if (possibilitiesInGrid.length) {
			// try each of the possible values in this empty square
			var x = possibilitiesInGrid[0].x;
			var y = possibilitiesInGrid[0].y;

			var possibilitiesHere = possibilitiesInGrid[0].possibilities
			for (var i=0; i<possibilitiesHere.length; i++) {
				grid.grid[x][y] = possibilitiesHere[i];

				var result = backtrackingCrossOffSolver.findSolution(grid);
				if (result.isSolution) {
					// found a solution on this branch! hurrah!
					return result;
				}
			}

			// reset this square so we're back where we started for backtracking
			grid.grid[x][y] = undefined;


			// didn't manage to make any progress this
			// iteration, so we can't solve with this approach
			return {isSolution: false, table: grid}
		} else {
			// full grid! done!
			return {isSolution: true, table: grid}
		}
	}
};

$(document).ready(function() {
	$('button#solve').click(function() {
		ui.addUserValuesClass();

		var currentTable = new SudokuGrid();
		currentTable.setFromSelector($("#sudoku input"));

		var start = new Date().getTime();
		
		var result = backtrackingCrossOffSolver.findSolution(currentTable);

		var end = new Date().getTime();
		var time = end - start;
		alert('Execution time: ' + time);
		
		if (result.isSolution) {
			var solvedTable = result.table;
			ui.setTable(solvedTable);
		} else {
			ui.removeUserValuesClass();
		}
	});
	

	$('button#clear_table').click(function() {
		ui.clearTable();
	});

	$('button#import_puzzle').click(function() {
		ui.clearTable();

		var puzzleString = prompt("Enter a puzzle string:");

		var table = new SudokuGrid();
		table.setFromString(puzzleString);
		ui.setTable(table);
		ui.checkTableIsValid();
	});

	// monitor table for changes, and warn immediately if the grid is invalid
	$("#sudoku input").keyup(function() {
		ui.checkTableIsValid();
	});

});