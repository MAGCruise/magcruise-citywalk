package org.magcruise.citywalk.model.relation;

import java.util.ArrayList;
import java.util.List;

import org.magcruise.citywalk.model.row.Movement;
import org.nkjmlab.util.db.DbClient;
import org.nkjmlab.util.db.Keyword;
import org.nkjmlab.util.db.RelationalModel;

public class MovementsTable extends RelationalModel<Movement> {

	public static final String TABLE_NAME = "MOVEMENTS";
	private static final String ID = "id";
	private static final String CREATED_AT = "created_at";
	private static final String USER_ID = "user_id";
	private static final String COURSE_ID = "course_id";
	private static final String CHECKPOINT_ID = "checkpoint_id";
	private static final String LAT = "lat";
	private static final String LON = "lon";
	private static final String ACCURACY = "accuracy";
	private static final String ALTITUDE = "altitude"; // null->-1
	private static final String ALTITUDE_ACCURACY = "altitude_accuracy"; // null->-1
	private static final String SPEED = "speed"; // null->-1
	private static final String HEADING = "heading"; // 0<=HEADING<360,
														// North->0, East->90,
														// South->180, West->270

	public MovementsTable(DbClient client) {
		super(TABLE_NAME, client);
		addColumnDefinition(ID, Keyword.BIGINT, Keyword.PRIMARY_KEY_AUTO_INCREMENT);
		addColumnDefinition(CREATED_AT, Keyword.TIMESTAMP);
		addColumnDefinition(USER_ID, Keyword.VARCHAR);
		addColumnDefinition(COURSE_ID, Keyword.VARCHAR);
		addColumnDefinition(CHECKPOINT_ID, Keyword.VARCHAR);
		addColumnDefinition(LAT, Keyword.DOUBLE);
		addColumnDefinition(LON, Keyword.DOUBLE);
		addColumnDefinition(ACCURACY, Keyword.DOUBLE);
		addColumnDefinition(ALTITUDE, Keyword.DOUBLE);
		addColumnDefinition(ALTITUDE_ACCURACY, Keyword.DOUBLE);
		addColumnDefinition(SPEED, Keyword.DOUBLE);
		addColumnDefinition(HEADING, Keyword.DOUBLE);
	}

	@Override
	public void createIndexes() {
	}

	public List<Movement> findByUserIdAndCourseId(String userId, String courseId,
			int incrementSize) {
		List<Movement> tmp = readListBy(USER_ID, userId, COURSE_ID, courseId);
		List<Movement> result = new ArrayList<>();
		for (int i = 0; i < tmp.size(); i += (incrementSize + 1)) {
			result.add(tmp.get(i));
		}
		return result;
	}

	public List<Movement> findByCourseId(String courseId, int incrementSize) {
		List<Movement> tmp = readListBy(COURSE_ID, courseId);
		List<Movement> result = new ArrayList<>();
		for (int i = 0; i < tmp.size(); i += (incrementSize + 1)) {
			result.add(tmp.get(i));
		}
		return result;
	}

}
