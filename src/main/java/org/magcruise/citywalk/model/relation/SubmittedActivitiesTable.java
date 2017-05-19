package org.magcruise.citywalk.model.relation;

import org.magcruise.citywalk.model.row.SubmittedActivity;
import org.nkjmlab.util.db.DbClient;

public class SubmittedActivitiesTable extends ActivitiesTable<SubmittedActivity> {

	public static final String TABLE_NAME = "SUBMITTED_ACTIVITIES";

	public SubmittedActivitiesTable(DbClient client) {
		super(TABLE_NAME, client);
	}

	@Override
	public void createIndexes() {
	}

}
