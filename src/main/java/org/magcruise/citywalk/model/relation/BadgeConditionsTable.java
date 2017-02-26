package org.magcruise.citywalk.model.relation;

import org.magcruise.citywalk.model.row.BadgeCondition;
import org.nkjmlab.util.db.DbClient;
import org.nkjmlab.util.db.Keyword;
import org.nkjmlab.util.db.RelationalModel;

public class BadgeConditionsTable extends RelationalModel<BadgeCondition> {

	public static final String TABLE_NAME = "BADGE_CONDITIONS";
	private static final String ID = "id";
	private static final String COURSE_ID = "course_id";
	private static final String NAME = "name";
	private static final String IMG_SRC = "img_src";
	private static final String TYPE = "type";
	private static final String VALUE = "value";

	public BadgeConditionsTable(DbClient client) {
		super(TABLE_NAME, client);
		addColumnDefinition(ID, Keyword.BIGINT, Keyword.PRIMARY_KEY_AUTO_INCREMENT);
		addColumnDefinition(COURSE_ID, Keyword.VARCHAR);
		addColumnDefinition(NAME, Keyword.VARCHAR);
		addColumnDefinition(IMG_SRC, Keyword.VARCHAR);
		addColumnDefinition(TYPE, Keyword.VARCHAR);
		addColumnDefinition(VALUE, Keyword.VARCHAR);
	}

	public BadgeCondition readOf(String courseId, String name) {
		return readListBy(COURSE_ID, courseId, NAME, name).get(0);
	}

}
