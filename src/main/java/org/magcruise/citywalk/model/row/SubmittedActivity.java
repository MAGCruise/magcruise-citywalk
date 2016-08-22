package org.magcruise.citywalk.model.row;

import org.magcruise.citywalk.model.input.Input;
import org.magcruise.citywalk.model.json.ActivityJson;
import org.magcruise.citywalk.model.relation.SubmittedActivitiesTable;

import net.sf.persist.annotations.Table;

@Table(name = SubmittedActivitiesTable.TABLE_NAME)
public class SubmittedActivity extends Activity {
	public SubmittedActivity() {
	}

	public SubmittedActivity(String userId, String checkpointId, double lat, double lon,
			String taskId,
			double score, Input input) {
		super(userId, checkpointId, lat, lon, taskId, score, input);
	}

	public SubmittedActivity(ActivityJson json) {
		super(json);
	}

}
