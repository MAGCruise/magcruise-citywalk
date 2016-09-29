package org.magcruise.citywalk.model.relation;

import java.util.List;
import java.util.stream.Collectors;

import org.magcruise.citywalk.ApplicationContext;
import org.magcruise.citywalk.model.row.Checkpoint;
import org.nkjmlab.util.db.Keyword;
import org.nkjmlab.util.db.RelationalModel;

public class CheckpointsTable extends RelationalModel<Checkpoint> {

	public static final String TABLE_NAME = "CHECKPOINTS";

	public static final String CHECKPOINT_GROUP_IDS = "checkpoint_group_ids";

	private static final String LAT = "lat";
	private static final String LON = "lon";
	private static final String ID = "id";
	private static final String NAME = "name";
	private static final String LABEL = "label";
	private static final String CREATED = "created";
	private static final String MARKER_COLOR = "marker_color";
	private static final String CATEGORY = "category";
	private static final String SUBCATEGORY = "subcategory";

	public CheckpointsTable() {
		super(TABLE_NAME, ApplicationContext.getDbClient());
		setAttribute(ID, Keyword.VARCHAR, Keyword.PRIMARY_KEY);
		setAttribute(CREATED, Keyword.TIMESTAMP_AS_CURRENT_TIMESTAMP);
		setAttribute(NAME, Keyword.VARCHAR);
		setAttribute(LABEL, Keyword.VARCHAR);
		setAttribute(LAT, Keyword.DOUBLE);
		setAttribute(LON, Keyword.DOUBLE);
		setAttribute(CHECKPOINT_GROUP_IDS, Keyword.VARCHAR);
		setAttribute(MARKER_COLOR, Keyword.VARCHAR);
		setAttribute(CATEGORY, Keyword.VARCHAR);
		setAttribute(SUBCATEGORY, Keyword.VARCHAR);
	}

	public List<Checkpoint> findByCheckpointGroupId(String checkpointGroupId) {
		return getClient().readList(Checkpoint.class,
				"SELECT * FROM " + TABLE_NAME)
				.stream().filter(c -> c.getCheckpointGroupIds().contains(checkpointGroupId))
				.collect(Collectors.toList());
	}

}
