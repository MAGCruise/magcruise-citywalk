package org.magcruise.citywalk.model.relation;

import java.util.List;

import org.magcruise.citywalk.model.row.Badge;
import org.nkjmlab.util.db.DbClient;
import org.nkjmlab.util.db.Keyword;
import org.nkjmlab.util.db.RelationalModel;

public class BadgesTable extends RelationalModel<Badge> {

	public static final String TABLE_NAME = "BADGES";
	private static final String ID = "id";
	private static final String CREATED_AT = "created_at";
	private static final String COURSE_ID = "course_id";
	private static final String USER_ID = "user_id";
	private static final String NAME = "name";

	public BadgesTable(DbClient client) {
		super(TABLE_NAME, client);
		addColumnDefinition(ID, Keyword.BIGINT, Keyword.PRIMARY_KEY_AUTO_INCREMENT);
		addColumnDefinition(CREATED_AT, Keyword.TIMESTAMP_AS_CURRENT_TIMESTAMP);
		addColumnDefinition(COURSE_ID, Keyword.VARCHAR);
		addColumnDefinition(USER_ID, Keyword.VARCHAR);
		addColumnDefinition(NAME, Keyword.VARCHAR);
	}

	public boolean contains(String userId, String badge) {
		return getClient()
				.readList(Badge.class, "SELECT * FROM " + getName() + " WHERE " + USER_ID
						+ "=? AND " + NAME + "=?", userId, badge)
				.size() > 0;
	}

	public List<Badge> readOf(String courseId, String userId) {
		return readListBy(USER_ID, userId, COURSE_ID, courseId);
	}

}
