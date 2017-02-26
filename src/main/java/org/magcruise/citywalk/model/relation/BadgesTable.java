package org.magcruise.citywalk.model.relation;

import java.util.List;
import java.util.stream.Collectors;

import org.magcruise.citywalk.model.row.Badge;
import org.nkjmlab.util.db.DbClient;
import org.nkjmlab.util.db.Keyword;
import org.nkjmlab.util.db.RelationalModel;

public class BadgesTable extends RelationalModel<Badge> {

	public static final String TABLE_NAME = "BADGES";
	private static final String ID = "id";
	private static final String CREATED_AT = "created_at";
	private static final String USER_ID = "user_id";
	private static final String BADGE_DEFINITION_ID = "badge_definition_id";

	public BadgesTable(DbClient client) {
		super(TABLE_NAME, client);
		addColumnDefinition(ID, Keyword.BIGINT, Keyword.PRIMARY_KEY_AUTO_INCREMENT);
		addColumnDefinition(CREATED_AT, Keyword.TIMESTAMP_AS_CURRENT_TIMESTAMP);
		addColumnDefinition(USER_ID, Keyword.VARCHAR);
		addColumnDefinition(BADGE_DEFINITION_ID, Keyword.VARCHAR);
	}

	public boolean contains(long badgeDefinitionId) {
		return readListBy(BADGE_DEFINITION_ID, badgeDefinitionId).size() > 0;
	}

	public List<Badge> findBy(String userId, String courseId,
			BadgeDefinitionsTable definitionsTable) {
		return readListBy(USER_ID, userId).stream()
				.filter(b -> definitionsTable.readByPrimaryKey(b.getBadgeDefinitionId()).getCourseId()
						.equals(courseId))
				.collect(Collectors.toList());

	}

}
