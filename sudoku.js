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
	}
}
