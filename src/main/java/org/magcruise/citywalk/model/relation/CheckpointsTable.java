package org.magcruise.citywalk.model.relation;

import java.util.List;
import java.util.stream.Collectors;

import org.magcruise.citywalk.model.row.Checkpoint;
import org.nkjmlab.util.db.DbClient;
import org.nkjmlab.util.db.Keyword;
import org.nkjmlab.util.db.RelationalModel;

public class CheckpointsTable extends RelationalModel<Checkpoint> {

	public static final String TABLE_NAME = "CHECKPOINTS";

	public static final String COURSE_IDS = "course_ids";

	private static final String LAT = "lat";
	private static final String LON = "lon";
	private static final String ID = "id";
	private static final String NAME = "name";
	private static final String LABEL = "label";
	private static final String DESCRIPTION = "description";
	private static final String CREATED_AT = "created_at";
	private static final String MARKER_COLOR = "marker_color";
	private static final String CATEGORY = "category";
	private static final String SUBCATEGORY = "subcategory";
	private static final String VISIBLE_TIME_FROM = "visible_time_from";
	private static final String VISIBLE_TIME_TO = "visible_time_to";
	private static final String IMG_SRC = "img_src";
	private static final String PLACE = "place";

	public CheckpointsTable(DbClient client) {
		super(TABLE_NAME, client);
		addColumnDefinition(ID, Keyword.VARCHAR, Keyword.PRIMARY_KEY);
		addColumnDefinition(CREATED_AT, Keyword.TIMESTAMP_AS_CURRENT_TIMESTAMP);
		addColumnDefinition(NAME, Keyword.VARCHAR);
		addColumnDefinition(LABEL, Keyword.VARCHAR);
		addColumnDefinition(DESCRIPTION, Keyword.VARCHAR);
		addColumnDefinition(LAT, Keyword.DOUBLE);
		addColumnDefinition(LON, Keyword.DOUBLE);
		addColumnDefinition(COURSE_IDS, Keyword.VARCHAR);
		addColumnDefinition(MARKER_COLOR, Keyword.VARCHAR);
		addColumnDefinition(CATEGORY, Keyword.VARCHAR);
		addColumnDefinition(SUBCATEGORY, Keyword.VARCHAR);
		addColumnDefinition(VISIBLE_TIME_FROM, Keyword.TIMESTAMP);
		addColumnDefinition(VISIBLE_TIME_TO, Keyword.TIMESTAMP);
		addColumnDefinition(IMG_SRC, Keyword.VARCHAR);
		addColumnDefinition(PLACE, Keyword.VARCHAR);
	}

	@Override
	public void createIndexes() {
	}

	public List<Checkpoint> findByCourseId(String courseId) {
		return getClient().readList(Checkpoint.class, "SELECT * FROM " + TABLE_NAME).stream()
				.filter(c -> c.getCourseIds().contains(courseId))
				.collect(Collectors.toList());
	}

}
