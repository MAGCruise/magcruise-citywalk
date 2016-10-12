package org.magcruise.citywalk.model.relation;

import org.magcruise.citywalk.ApplicationContext;
import org.magcruise.citywalk.model.row.Movement;
import org.nkjmlab.util.db.Keyword;
import org.nkjmlab.util.db.RelationalModel;

public class MovementsTable extends RelationalModel<Movement> {

	public static final String TABLE_NAME = "MOVEMENTS";
	private static final String ID = "id";
	private static final String CREATED = "created";
	private static final String USER_ID = "user_id";
	private static final String CHECKPOINT_GROUP_ID = "checkpoint_group_id";
	private static final String CHECKPOINT_ID = "checkpoint_id";
	private static final String LAT = "lat";
	private static final String LON = "lon";
	private static final String HEADING = "heading";

	public MovementsTable() {
		super(TABLE_NAME, ApplicationContext.getDbClient());
		addColumnDefinition(ID, Keyword.BIGINT, Keyword.PRIMARY_KEY_AUTO_INCREMENT);
		addColumnDefinition(CREATED, Keyword.TIMESTAMP_AS_CURRENT_TIMESTAMP);
		addColumnDefinition(USER_ID, Keyword.VARCHAR);
		addColumnDefinition(CHECKPOINT_GROUP_ID, Keyword.VARCHAR);
		addColumnDefinition(CHECKPOINT_ID, Keyword.VARCHAR);
		addColumnDefinition(LAT, Keyword.DOUBLE);
		addColumnDefinition(LON, Keyword.DOUBLE);
		addColumnDefinition(HEADING, Keyword.DOUBLE);
	}

}
