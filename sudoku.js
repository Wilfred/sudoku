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

		var GROUPWIDTH = 3;
		var GROUPHEIGHT = 3;

		var total = 0;
		for (var i=x*GROUPWIDTH; i<(x+1)*GROUPWIDTH; i++) {
			for (var j=y*GROUPHEIGHT; j<(y+1)*GROUPHEIGHT; j++) {
				group.push(table[j][i]);
			}
		}

		return group;
	}
}
