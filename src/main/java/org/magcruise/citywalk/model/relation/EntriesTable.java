package org.magcruise.citywalk.model.relation;

import java.util.List;

import org.magcruise.citywalk.model.row.Entry;
import org.nkjmlab.util.db.DbClient;
import org.nkjmlab.util.db.Keyword;
import org.nkjmlab.util.db.RelationalModel;

public class EntriesTable extends RelationalModel<Entry> {

	public static final String TABLE_NAME = "ENTRIES";

	public static final String ID = "id";
	public static final String USER_ID = "user_id";
	public static final String COURSE_ID = "course_id";
	public static final String CREATED_AT = "created_at";

	public EntriesTable(DbClient client) {
		super(TABLE_NAME, client);
		addColumnDefinition(ID, Keyword.BIGINT, Keyword.PRIMARY_KEY_AUTO_INCREMENT);
		addColumnDefinition(CREATED_AT, Keyword.TIMESTAMP);
		addColumnDefinition(USER_ID, Keyword.VARCHAR);
		addColumnDefinition(COURSE_ID, Keyword.VARCHAR);
	}

	@Override
	public void createIndexes() {
	}

	public List<Entry> findUserId(String userId) {
		return readListBy(USER_ID, userId);
	}

}
