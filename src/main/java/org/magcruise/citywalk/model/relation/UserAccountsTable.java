package org.magcruise.citywalk.model.relation;

import org.magcruise.citywalk.model.row.UserAccount;
import org.nkjmlab.util.db.DbClient;
import org.nkjmlab.util.db.Keyword;
import org.nkjmlab.util.db.RelationalModel;

public class UserAccountsTable extends RelationalModel<UserAccount> {

	public static final String TABLE_NAME = "USER_ACCOUNTS";

	public static final String ID = "id";
	public static final String CREATED_AT = "created_at";
	public static final String PIN = "pin";
	public static final String LANGUAGE = "language";
	public static final String ENVIRONMENT = "environment";

	public UserAccountsTable(DbClient client) {
		super(TABLE_NAME, client);
		addColumnDefinition(ID, Keyword.VARCHAR, Keyword.PRIMARY_KEY);
		addColumnDefinition(CREATED_AT, Keyword.TIMESTAMP);
		addColumnDefinition(PIN, Keyword.INTEGER);
		addColumnDefinition(LANGUAGE, Keyword.VARCHAR);
		addColumnDefinition(ENVIRONMENT, Keyword.VARCHAR);
	}

	@Override
	public void createIndexes() {
	}

	public boolean exists(String userId) {
		UserAccount user = new UserAccount();
		user.setId(userId);
		return getClient().exists(user);
	}

}
