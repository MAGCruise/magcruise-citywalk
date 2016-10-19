package org.magcruise.citywalk.model.relation;

import org.magcruise.citywalk.ApplicationContext;
import org.magcruise.citywalk.model.row.Entry;
import org.magcruise.citywalk.model.row.UserAccount;
import org.nkjmlab.util.db.Keyword;
import org.nkjmlab.util.db.RelationalModel;

public class EntriesTable extends RelationalModel<Entry> {

	public static final String TABLE_NAME = "ENTRIES";

	public static final String ID = "id";
	public static final String USER_ID = "user_id";
	public static final String CHECKPOINT_GROUP_ID = "checkpoint_group_id";
	public static final String CREATED_AT = "created_at";

	public EntriesTable() {
		super(TABLE_NAME, ApplicationContext.getDbClient());
		addColumnDefinition(ID, Keyword.BIGINT, Keyword.PRIMARY_KEY_AUTO_INCREMENT);
		addColumnDefinition(CREATED_AT, Keyword.TIMESTAMP_AS_CURRENT_TIMESTAMP);
		addColumnDefinition(USER_ID, Keyword.VARCHAR);
		addColumnDefinition(CHECKPOINT_GROUP_ID, Keyword.VARCHAR);
	}

	public boolean exists(String userId) {
		UserAccount user = new UserAccount();
		user.setId(userId);
		return getClient().exists(user);
	}

}