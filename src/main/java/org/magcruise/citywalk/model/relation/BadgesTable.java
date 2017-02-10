package org.magcruise.citywalk.model.relation;

import java.util.List;

import org.magcruise.citywalk.ApplicationContext;
import org.magcruise.citywalk.model.row.Badge;
import org.nkjmlab.util.db.Keyword;
import org.nkjmlab.util.db.RelationalModel;

public class BadgesTable extends RelationalModel<Badge> {

	public static final String TABLE_NAME = "BADGES";
	private static final String ID = "id";
	private static final String CREATED_AT = "created_at";
	private static final String USER_ID = "user_id";
	private static final String BADGE = "badge";

	public BadgesTable() {
		super(TABLE_NAME, ApplicationContext.getDbClient());
		addColumnDefinition(ID, Keyword.BIGINT, Keyword.PRIMARY_KEY_AUTO_INCREMENT);
		addColumnDefinition(CREATED_AT, Keyword.TIMESTAMP_AS_CURRENT_TIMESTAMP);
		addColumnDefinition(USER_ID, Keyword.VARCHAR);
		addColumnDefinition(BADGE, Keyword.VARCHAR);
	}

	public boolean contains(String userId, String badge) {
		return getClient()
				.readList(Badge.class, "SELECT * FROM " + getName() + " WHERE " + USER_ID
						+ "=? AND " + BADGE + "=?", userId, badge)
				.size() > 0;
	}

	public List<Badge> readOf(String userId) {
		return readListBy(USER_ID, userId);
	}

}
