package org.magcruise.citywalk.model.relation;

import org.magcruise.citywalk.ApplicationContext;
import org.magcruise.citywalk.model.row.UserAccount;
import org.nkjmlab.util.db.Keyword;
import org.nkjmlab.util.db.RelationalModel;

public class UserAccountsTable extends RelationalModel<UserAccount> {

	public static final String TABLE_NAME = "USER_ACCOUNTS";

	public static final String ID = "id";
	public static final String CREATED = "created";
	public static final String GROUP_ID = "group_id";

	public UserAccountsTable() {
		super(TABLE_NAME, ApplicationContext.getDbClient());
		addColumnDefinition(ID, Keyword.VARCHAR, Keyword.PRIMARY_KEY);
		addColumnDefinition(CREATED, Keyword.TIMESTAMP_AS_CURRENT_TIMESTAMP);
		addColumnDefinition(GROUP_ID, Keyword.VARCHAR);
	}

	public boolean exists(String userId) {
		UserAccount user = new UserAccount();
		user.setId(userId);
		return getClient().exists(user);
	}

}
