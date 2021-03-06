package org.magcruise.citywalk.model.relation;

import org.magcruise.citywalk.model.row.Category;
import org.nkjmlab.util.db.DbClient;
import org.nkjmlab.util.db.Keyword;
import org.nkjmlab.util.db.Table;

public class CategoriesTable extends Table<Category> {

	public static final String TABLE_NAME = "CATEGORIES";
	private static final String ID = "id";
	private static final String COURSE_ID = "course_id";
	private static final String NAME = "name";
	private static final String IMG_SRC = "img_src";

	public CategoriesTable(DbClient client) {
		super(TABLE_NAME, client);
		addColumnDefinition(ID, Keyword.BIGINT, Keyword.PRIMARY_KEY_AUTO_INCREMENT);
		addColumnDefinition(COURSE_ID, Keyword.VARCHAR);
		addColumnDefinition(NAME, Keyword.VARCHAR);
		addColumnDefinition(IMG_SRC, Keyword.VARCHAR);
	}

	@Override
	public void createIndexes() {
	}

}
