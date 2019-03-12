package org.magcruise.citywalk.model.relation;

import org.magcruise.citywalk.model.row.Course;
import org.nkjmlab.util.db.DbClient;
import org.nkjmlab.util.db.Keyword;
import org.nkjmlab.util.db.Table;

public class CoursesTable extends Table<Course> {

	public static final String TABLE_NAME = "COURSES";
	private static final String ID = "id";
	private static final String NAME = "name";
	private static final String MAX_CATEGORY_DEPTH = "max_category_depth";
	private static final String DISABLED = "disabled";

	public CoursesTable(DbClient client) {
		super(TABLE_NAME, client);
		addColumnDefinition(ID, Keyword.VARCHAR, Keyword.PRIMARY_KEY);
		addColumnDefinition(NAME, Keyword.VARCHAR);
		addColumnDefinition(MAX_CATEGORY_DEPTH, Keyword.INTEGER);
		addColumnDefinition(DISABLED, Keyword.BOOLEAN);
	}

	@Override
	public void createIndexes() {
	}

}
